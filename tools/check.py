"""Public, dependency-free export validation; run before deploying the manifest."""
import argparse
import json
import shutil
import re
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from urllib.request import urlopen
import xml.etree.ElementTree as ET

SITE = 'https://nobot-kang.github.io/'


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.jsons, self.meta = set(), [], [], {}
        self.script = None
        self.h1 = 0
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, f'duplicate id: {a["id"]}'
            self.ids.add(a['id'])
        if tag == 'h1':
            self.h1 += 1
        for key in ('href', 'src'):
            if key in a:
                self.links.append(a[key])
        if 'srcset' in a:
            self.links.extend(item.strip().split()[0] for item in a['srcset'].split(','))
        if tag == 'script' and a.get('type') in {'application/json', 'application/ld+json'}:
            self.script = ''
        if tag == 'meta':
            self.meta[a.get('name', a.get('property', a.get('http-equiv')))] = a.get('content')
        if tag == 'img':
            assert 'alt' in a and 'width' in a and 'height' in a, 'image needs alt and dimensions'

    def handle_data(self, data):
        if self.script is not None:
            self.script += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.script is not None:
            self.jsons.append(json.loads(self.script))
            self.script = None


def check(root):
    names = json.loads((root/'public-files.json').read_text())
    assert len(names) == len(set(names))
    games = json.loads((root/'games.json').read_text())
    game_routes = [game['route'] for game in games]
    assert len(game_routes) == len(set(game_routes)), 'duplicate game route'
    assert all(re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*/', route) for route in game_routes), 'invalid game route'
    game_paths = {'/'+route for route in game_routes}
    docs = {}
    for name in names:
        path = root/name
        assert not path.is_symlink() and path.is_file(), f'missing or symlink: {name}'
        assert root.resolve() in path.resolve().parents and '..' not in Path(name).parts
        if name.endswith('.json'):
            json.loads(path.read_text())
        if name.endswith('.html'):
            source = path.read_text()
            assert '{{' not in source and '원로' not in source, name
            assert ('kang.nobot@gmail.com' not in source) or name == 'privacy/index.html', name
            doc = docs[name] = Document(source)
            assert doc.h1 == 1 and len(doc.jsons) == 2, name
            assert '글·그림 CC BY-SA 4.0' in source and '캐릭터 All rights reserved' in source, name
            assert 'CC BY-NC' not in source, name
            assert doc.meta['referrer'] == 'strict-origin-when-cross-origin', name
            assert "object-src 'none'" in doc.meta['Content-Security-Policy'], name
            schema, runtime = doc.jsons
            assert runtime['production_hosts'] == ['nobot-kang.github.io'], name
            if name in {'privacy/index.html', 'license/index.html', '404.html'}:
                assert runtime['ads_enabled'] is False and 'data-ad-placement=' not in source, name
            if name.startswith('posts/'):
                assert schema['@type'] == 'BlogPosting', name
                for key in ('datePublished', 'dateModified', 'publisher', 'mainEntityOfPage', 'image'):
                    assert schema[key], (name, key)
                assert schema['image'].endswith('.png'), name
                dates = [datetime.fromisoformat(schema[key]) for key in ('datePublished', 'dateModified')]
                assert all(value.tzinfo is not None for value in dates), f'{name}: timezone required'
                assert dates[0] <= dates[1], name
            if name == '404.html':
                assert doc.meta['robots'] == 'noindex'
                assert all(link.startswith(('/', 'https:', '#', 'mailto:')) for link in doc.links), '404 needs root links'
    external = set()
    for name, doc in docs.items():
        for link in doc.links:
            url = urlsplit(urljoin(SITE+name, link))
            if url.scheme in {'mailto', 'data'}:
                continue
            if url.netloc != urlsplit(SITE).netloc or any(url.path.startswith(game) for game in game_paths):
                if url.scheme in {'http', 'https'}:
                    external.add(url.geturl())
                continue
            target = unquote(url.path).lstrip('/')
            if not target or target.endswith('/'):
                target += 'index.html'
            assert target in names, f'{name}: broken link {link}'
            if url.fragment:
                assert target in docs and unquote(url.fragment) in docs[target].ids, f'{name}: broken anchor {link}'
    assert docs['index.html'].jsons[0]['@type'] == 'WebSite'
    assert (root/'.nojekyll').is_file()
    sitemap = ET.parse(root/'sitemap.xml')
    ns = {'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
    entries = sitemap.findall('s:url', ns)
    locations = {el.findtext('s:loc', namespaces=ns) for el in entries}
    expected = {SITE+name.removesuffix('index.html') for name in docs if name != '404.html'}
    game_urls = {SITE+route for route in game_routes}
    assert not expected & game_urls, 'game routes must not shadow blog pages'
    assert game_urls <= set(docs['index.html'].links), 'every game needs a home link'
    expected |= game_urls
    assert len(entries) == len(locations) and locations == expected, 'sitemap must match indexable pages and games'
    by_url = {el.findtext('s:loc', namespaces=ns):el for el in entries}
    for location, entry in by_url.items():
        modified = entry.findtext('s:lastmod', namespaces=ns)
        if location not in game_urls:
            assert modified, 'blog sitemap entries require lastmod'
        if modified:
            assert re.fullmatch(r'\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2}))?', modified), 'invalid lastmod'
            datetime.fromisoformat(modified)
    for name, doc in docs.items():
        if name.startswith('posts/'):
            assert by_url[SITE+name.removesuffix('index.html')].findtext('s:lastmod', namespaces=ns) == doc.jsons[0]['dateModified'], 'article lastmod must match dateModified'
    for game in games:
        assert by_url[SITE+game['route']].findtext('s:lastmod', namespaces=ns) == game.get('modified'), 'game lastmod requires verified metadata'
    print(f'{len(names)} public files, {len(docs)} pages: links, anchors, JSON, policy and metadata passed')
    return names, external


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path('.'))
    parser.add_argument('--stage', type=Path)
    parser.add_argument('--external', action='store_true')
    args = parser.parse_args()
    names, links = check(args.root)
    if args.external:
        for url in sorted(links):
            with urlopen(url, timeout=30) as response:
                assert response.status == 200, url
            print('OK', url)
    if args.stage:
        assert not args.stage.exists(), 'staging destination must be new'
        for name in names:
            dest = args.stage/name
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(args.root/name, dest)


if __name__ == '__main__':
    main()
