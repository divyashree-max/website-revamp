/** Hysteresis measured against the smaller of section and viewport, including tall mobile layouts. */
export function createSectionEntryGate({enter=.5,exit=.1,onEnter,onExit}={}){
 let armed=true,inside=false,entries=0;
 return {update(fraction){
  if(fraction<exit){if(inside){inside=false;onExit?.()}armed=true;}
  else if(fraction>=enter&&armed){armed=false;inside=true;entries++;onEnter?.()}
 },get state(){return {armed,inside,entries}}};
}
