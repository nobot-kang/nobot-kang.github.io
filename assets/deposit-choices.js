const root=document.querySelector('[data-deposit-choices]');
if(root){
 const states={confirmed:'조건 확인',none_in_modeled_cohort:'분석 재고 중 없음',small_subset:'판단 유보(소수)',insufficient_source:'근거 부족'};
 const node=(tag,attrs={},text)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text!==undefined)n.textContent=text;return n;};
 Promise.all(['deposit-choices.json','jeonse-map-locations.json'].map(n=>fetch(new URL(n,import.meta.url)).then(r=>{if(!r.ok)throw Error(r.status);return r.json();}))).then(([d,locations])=>{
  const area=root.querySelector('[data-area]'),budget=root.querySelector('[data-budget]'),side=root.querySelector('[data-side]'),region=root.querySelector('[data-region]');
  const rows=new Map(d.rows.map(r=>[[r.region,r.scope,r.budget_eok,r.side].join('|'),r]));
  const get=(c,s=side.value)=>rows.get([c,area.value,budget.value,s].join('|'));
  function map(prefix,title){
   const codes=Object.keys(d.regions).filter(c=>c.startsWith(prefix)),coords=codes.map(c=>locations.points[c]);
   const minX=Math.min(...coords.map(p=>p.longitude))-.04,maxX=Math.max(...coords.map(p=>p.longitude))+.04,minY=Math.min(...coords.map(p=>p.latitude))-.04,maxY=Math.max(...coords.map(p=>p.latitude))+.04;
   const svg=node('svg',{viewBox:'0 0 360 370',role:'img','aria-label':title+' '+d.dates[side.value]+' 보증금 조건. 지역별 판정은 전체 표에서도 확인할 수 있습니다.'});
   svg.append(node('text',{x:18,y:27,'font-size':17,'font-weight':700,fill:'#173249'},title),node('text',{x:318,y:27,'font-size':12,fill:'#465967'},'북 ↑'));
   codes.forEach(c=>{const p=locations.points[c],r=get(c),x=24+(p.longitude-minX)/(maxX-minX)*312,y=325-(p.latitude-minY)/(maxY-minY)*280;
    const g=node('g');g.append(node('title',{},d.regions[c]+': '+states[r.state]));
    if(r.state==='confirmed')g.append(node('circle',{cx:x,cy:y,r:7,fill:'#174666'}));
    else if(r.state==='none_in_modeled_cohort')g.append(node('rect',{x:x-6,y:y-6,width:12,height:12,fill:'#fff',stroke:'#6b547b','stroke-width':2}));
    else if(r.state==='small_subset')g.append(node('path',{d:`M${x} ${y-8}l8 14h-16z`,fill:'#9d632e'}));
    else g.append(node('path',{d:`M${x-5} ${y-5}l10 10m0-10l-10 10`,stroke:'#59666f','stroke-width':2}));
    svg.append(g);if(c===region.value)svg.append(node('circle',{cx:x,cy:y,r:12,fill:'none',stroke:'#bd5a08','stroke-width':2.5}));
   });
   if(region.value.startsWith(prefix))svg.append(node('text',{x:180,y:358,'text-anchor':'middle','font-size':15,fill:'#173249'},d.regions[region.value]+' · '+states[get(region.value).state]));
   return svg;
  }
  function render(){
   root.querySelector('[data-map-panels]').replaceChildren(map('11','서울 25구'),map('41','수집 경기 36지역'));
   const cohort=d.cohorts.find(r=>r.region===region.value&&r.scope===area.value);
   const phrase=s=>{const r=get(region.value,s);return d.dates[s]+': '+states[r.state]+' · '+(r.share_pct===null?'비율 미제시':r.share_pct+'%');};
   root.querySelector('[data-selection]').textContent=d.regions[region.value]+' · '+d.scopes[area.value]+' · '+budget.value+'억 원. '+phrase('prior')+' / '+phrase('current')+'. 알려진 재고 포함률 '+cohort.known_stock_coverage_pct+'%'+(cohort.limited_representation?' · 대표 범위 제한':'')+'.';
  }
  [area,budget,side,region].forEach(el=>el.addEventListener('change',render));render();root.dataset.ready='true';
 }).catch(()=>{root.querySelector('[data-selection]').textContent='대화형 지도를 불러오지 못했습니다. 아래 전체 지역 표를 이용해 주세요.';});
}
