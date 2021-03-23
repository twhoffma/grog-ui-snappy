var sidenavTemplate = Handlebars.templates.sidenav_lists;
var geeklistsTemplate = Handlebars.templates.sidenav_listitem;

var loadedGeeklists = [];
var orderbyopts = [    										
	{name:"year", active: false, icon: "far fa-calendar-alt"},
	{name:"name", active: true, icon: "fas fa-font"},
	{name:"update", active: false, icon: "fas fa-power-off"},
	{name:"group", active: false, icon: "fas fa-tags"}
];
	      
//Render main sidebar - empty
console.log( document.getElementById("sidenavGeeklists"));
document.getElementById("sidenavGeeklists").innerHTML = sidenavTemplate({
  orderby: orderbyopts
});


//Close event
document.querySelectorAll(".closeSideNavBtn").forEach(b=>b.addEventListener('click', function(e){
    //(e.target || e.srcElement).parentNode.parentNode.parentNode.style.display = "none";
    document.getElementById("sidenavGeeklists").style.display="none";
})
);

//Sort event
var sortBtns = document.querySelectorAll(".sideNavBtn");

sortBtns.forEach(b=>b.addEventListener('click', function (event) {
  // Prevent the link from updating the URL
  event.preventDefault();

  let el = event.target || event.srcElement;

  //Override since it is possible to click on I
  if(el.tagName === "I"){
    el = el.parentNode;	
  }

  if(el.tagName === "SPAN"){
    el = el.parentNode;	
  }
				
  let grpBy = el.dataset.glazeOrderby;
  let asc = el.dataset.glazeOrderbyAsc;

  el.dataset.glazeOrderbyAsc = el.dataset.glazeOrderbyAsc == 1 ? 0 : 1;
  
  renderSidebarGeeklists(grpBy, asc)
}, false));

function groupList(lists, groupTerm, asc){
	return lists.reduce(function(a,v){
				let groupLists = a.filter(x => x.name === v[groupTerm]);
 
				if(groupLists.length === 0){
					groupLists = {name: v[groupTerm], geeklists: []};
					a.push(groupLists);
				}else{
					groupLists = groupLists[0];
				}
				
				groupLists.geeklists.push(v);
				
				return a
			}, []).sort(function(a,b){
				var c = a;
				var d = b;
			
				if(asc == 0){
					c = b;
					d = a;
				}
			
				return c.name < d.name ? -1 : 1
});
}

function renderSidebarGeeklists(grp, asc){
	let grpLists = groupList(loadedGeeklists, grp, asc);

	document.getElementById("sidenavLists").innerHTML = geeklistsTemplate({grp: grpLists});
}

export function setSidebarGeeklists(geeklists, grp){
	loadedGeeklists = geeklists;

	var sidenavGeeklistData = {
	  orderby: orderbyopts, 
	  geeklists: geeklists
	};

	renderSidebarGeeklists(grp || "update", 0);
}
