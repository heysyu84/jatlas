// Editorial entry points for Korean travelers; this is not a visitor ranking.
export const discoveryDestinations = [
  {pref:"도쿄",english:"TOKYO",places:["13-P0013","13-P0001","13-P0012","13-P0008"]},
  {pref:"오사카",english:"OSAKA",places:["27-P0001","27-P0007","27-P0013","27-P0004"]},
  {pref:"후쿠오카",english:"FUKUOKA",places:["40-P0008","40-P0005","40-P0002","40-P0013"]},
  {pref:"교토",english:"KYOTO",places:["26-P0001","26-P0004","26-P0002","26-P0010"]},
  {pref:"홋카이도",english:"HOKKAIDO",places:["01-P0008","01-P0011","01-P0028","01-P0026"]},
  {pref:"오키나와",english:"OKINAWA",places:["47-P0020","47-P0017","47-P0010","47-P0021"]},
] as const;

export function orderDiscoveries<T extends {id:string;pref:string}>(items:readonly T[]):T[] {
  const groups=new Map<string,{items:T[];next:number}>();
  for(const item of items){
    let group=groups.get(item.pref);
    if(!group){group={items:[],next:0};groups.set(item.pref,group);}
    group.items.push(item);
  }
  for(const destination of discoveryDestinations){
    const priorities=new Map<string,number>(destination.places.map((id,index)=>[id,index]));
    groups.get(destination.pref)?.items.sort((a,b)=>(priorities.get(a.id)??priorities.size)-(priorities.get(b.id)??priorities.size));
  }
  const ordered:T[]=[];
  const take=(pref:string)=>{
    const group=groups.get(pref);
    if(!group||group.next>=group.items.length)return;
    ordered.push(group.items[group.next++]);
  };
  // The first 24 cards give six destinations equal space. Further cards
  // alternate across all prefectures, preserving every matching item.
  for(let round=0;round<4;round++)for(const destination of discoveryDestinations)take(destination.pref);
  while(ordered.length<items.length)for(const pref of groups.keys())take(pref);
  return ordered;
}
