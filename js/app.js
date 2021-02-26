(
	function(){
		var ui;
		var data;
		var selectedGeeklist = 0;
		var sorting;
		var filter;
		var graphs;
			
		document.addEventListener("DomContentLoaded", function(){
			ui = init_ui();
			data = init_data();
			sidenav_geeklists = init_sidebar_geeklists();
			hdr = init_header();
			graphs = init_graphs();
				
			ui.clearErrorMessage();
							
			var h = ui.getHistory();
			
			data.getGeeklists().then(function(r){
				sidenav_geeklists.setGeeklistsSidebar(r);
				
				let filters = {};
				
				if(h.active !== undefined){
					filters['active'] = (h.active === "true");
				}
				
				if(h.listgroup !== undefined){
					filters['listgroup'] = h.listgroup;
				}
				
				if(h.listyear !== undefined){
					filters['listyear'] = parseInt(h.listyear);
				}
				
				if(h.listtype !== undefined){
					filters['listtype'] = h.listtype;
				}
				
				ui.renderMenuGeeklists(r, filters);
				
				if(h.id !== undefined){
					document.getElementById('geeklists').style.display = "none";
				}
			}).catch(function(e){
				ui.setErrorMessage(e);
			});
			
			//Render args in header
			ui.renderUntoggleLinks(h);
				
			//If id of a specific geeklist is in args, load that one.	
			if(h.id !== undefined){
				//$(".listHeaderButtons").show();
				Array.from(document.getElementsByclassName("listHeaderButtons")).forEach(e => e.style.display = "block");
				//$("#loadmore").show();
				document.getElementById("loadmore").style.display = "block";

				selectedGeeklist = h.id;
				
				if(h.sorting != undefined){
					ui.setSorting(h.sorting);
					sorting = h.sorting;
				}
				
				//Parse filters
				if(h.filters != undefined){
					filter = h.filters;
				}
				
				loadGeeklist(h.id, true, false, true);
			}
			
			Array.from(document.getElementsByTagName("select")).forEach(function(e){
				e.addEventListener("click", guesstimate_obs);
				e.addEventListener("ontouchstart", guesstimate_obs);

			});
			/*
			$('select').on("change", function(){
				guesstimate_obs();	
				//FIXME: At some point add estimators for range sliders
			});
			*/

			//$('#loadmore').on("click", function(){
			let e = document.getElementById('loadmore');
			e.addEventListener("click", () => loadGeeklist(selectedGeeklist, false, false, false));
			e.addEventListener("ontouchstart", () => loadGeeklist(selectedGeeklist, false, false, false));
			
			/*
			$('.dropdown-menu').on("click", ".geeklist-menu-item", function(){
				loadGeeklist(this.dataset.geeklistid, true, true, true);
			});
			*/
			/*
			$('#sidenavLists').on("click", ".geeklist-menu-item", function(){
				loadGeeklist(this.dataset.geeklistid, true, true, true);
				$('#sidenavGeeklists').toggle();	
			});
			*/

			$('button#sort,button#filter,button#apply').on("click", function(){
				loadGeeklist(selectedGeeklist, true, false, false);
			});
			
			$('body').on('shown.bs.modal', "#modSortingAndFilters", function (e) {
				ui.setFilters(filter);
			});
			
			$('#resetSorting').on('click', function(){
				ui.resetSorting();
			});
			
			$('#resetFilters').on('click', function(){
				ui.resetFilters();
			});
			
			$('input[name=graph_valattr]').on('click', function(e){
				graphs.getGraphData(selectedGeeklist).then(function(r){
					
					var radios = document.querySelectorAll('input[name="graph_valattr"]:checked');
					var valattr = (radios.length > 0 ? radios[0].value : "value");
					
					graphs.renderGraphs(r, selectedGeeklist, valattr);

				});
			});
			
			$('.listHeaderButton').on('click', function(e){
				if(e.target.tagName.toUpperCase() === 'I'){
					e = e.target.parentNode;
				}
				
				if(e.target.dataset.glazeShow == "sidebar_list"){
					$('#sidenavGeeklists').toggle();
				}else if(e.target.dataset.glazeShow == "geeklist"){
					$('#geeklist').show();
					$('#graphs').hide();
				}else if(e.target.dataset.glazeShow == "charts"){
					$('#geeklist').hide();
					$('#graphs').show();
				}
			});
			
			function guesstimate_obs(){
				var obs = Infinity;
				
				['boardgamedesigner', 'boardgameartist', 'boardgamemechanic', 'boardgamecategory', 'boardgamefamily', 'boardgamepublisher'].forEach(function(v, i){				
					var e = document.getElementById('' + v);
					
					if(e.options[e.selectedIndex].text !== 'Any'){
						
						if(obs > parseInt(e.options[e.selectedIndex].dataset.obs)){
							obs = parseInt(e.options[e.selectedIndex].dataset.obs);
							console.log('' + parseInt(e.options[e.selectedIndex].dataset.obs));
						}
					}
				});
				
				if(obs === Infinity){
					document.getElementById('guesstimated_obs').innerHTML = "&lt;&infin;";
				}else{
					document.getElementById('guesstimated_obs').innerHTML = "&leq;" + obs;
					console.log("N");
				}
			}
			
			function loadGeeklist(geeklistId, clearList, clearOptions, clearInfo){
				if(geeklistId === undefined){
					return 
				}
				
				var p = new Promise(function(resolve, reject){
					console.log("Start loading effect :)");
					hdr.toggleLoadingEffect();
					
					if(clearInfo){
						//Load geeklist info
						console.log("get some data!");
						data.getGeeklistDetails(geeklistId).then(function(r){
							let d = r[0];
							d.stats = {};
							hdr.setDetails(d);
							console.log(d);
						});
						
						//Load static geeklist filters
						data.getGeeklistFilters(geeklistId).then(function(r){
							ui.populateFilters(r);
							ui.setFilters(filter);
							ui.setSorting(sorting);
							
							console.log("All loaded");	
							resolve();
						}).then(function(r){
							graphs.getGraphData(geeklistId).then(function(r){
								
								var radios = document.querySelectorAll('input[name="graph_valattr"]:checked');
								var valattr = (radios.length > 0 ? radios[0].value : "value");
								
								graphs.renderGraphs(r, geeklistId, valattr);

							}).finally(e => resolve());
						});
					}else{
						console.log("Doing nothin'");
						resolve();
					}	
				}).catch(function(e){
					ui.setErrorMessage(e);
				});
				
				if(clearList){
					console.log("Reset.");	
					selectedGeeklist = geeklistId;
					
					//TODO: Get geeklist info and stats..
					
					//Clear list in UI preemptively. Looks better since it doesn't look like it is hanging.
					ui.clearGeeklist();
				}

				p.then(function(){
					if(clearOptions){
						sorting = ui.sortingDefault;
						filter = {};	
					}else{
						sorting = ui.getSorting();
						filter = ui.getFilters();
					}
					console.log("Options set");	
					ui.setHistory(selectedGeeklist, 0, 0, filter, sorting);
					var h = ui.getHistory();
					console.log(h);
					ui.renderUntoggleLinks(h);
					
					//Load geeklist contents
					ui.setLoadButtonState("loading");
					//var numLoaded = $('.gameline').length;
					var numLoaded = Array.from(document.getElementsByClassName('bg')).length;
					
					data.getGeeklist(selectedGeeklist, numLoaded, filter, sorting).then(function(r){
						ui.renderGeeklist(r, '', selectedGeeklist, clearList);
						
						console.log("Stop loading effect :)");	
						hdr.toggleLoadingEffect();
						if(r.length < 100){
							ui.setLoadButtonState("finished");
						}else{
							ui.setLoadButtonState();
						}
						
					});
				}).catch(function(e){	
					alert(e);
					ui.setErrorMessage(e);
				});
			}
		});
	}
)();
