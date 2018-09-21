var ipAddressCouchDb = "192.168.1.101:5984";
var numeros_titres;
var edition = false;
var already_new = false;

function parPerso(nom_perso, update_critere){
	var nom_acteur = "";

	$.ajax({
		url: "http://" + ipAddressCouchDb + "/kaamelott/_design/listes/_view/par_perso?startkey=%22" + nom_perso + "%22&endkey=%22" + nom_perso + "%22",
		success: function (data){
			var view = JSON.parse(data);				       	
			numeros_titres = [];        				       	 	
			$(view.rows).each( function (index, item) {
				numeros_titres.push(item.value);				           	
			});
			$.ajax({
				url: "http://" + ipAddressCouchDb + "/kaamelott/_design/listes/_view/persos_acteurs?startkey=%22" + nom_perso + "%22&endkey=%22" + nom_perso + "%22",
				async: false,
				success: function (data_acteur){
					var view_acteur = JSON.parse(data_acteur);				       				  
					if(view_acteur.rows.length > 0){      				       	 	
						nom_acteur = view_acteur.rows[0].value;								
					}
				}             
			}).responseText;
			if(update_critere){				
				$("#critere_selection").empty();
				$("#critere_selection").append(nom_perso + " (" + nom_acteur + ")");
			}
			generatePlayList(numeros_titres);
		}             
	});
}

function parActeur(nom_acteur){
	$.ajax({
		url: "http://" + ipAddressCouchDb + "/kaamelott/_design/listes/_view/acteurs_persos?startkey=%22" + nom_acteur + "%22&endkey=%22" + nom_acteur + "%22",
			success: function (data){
			var view = JSON.parse(data);				       	
			var nom_perso = "";  
			if(view.rows.length > 0){      				       	 	
				nom_perso = view.rows[0].value;	
				$("#critere_selection").empty();
				$("#critere_selection").append(nom_acteur + " (" + nom_perso + ")");			      
				parPerso(nom_perso, false);
			}
		}             
	});
}

function generatePlayList(){
	if($("#random_playlist_oui").is(":checked")){
		numeros_titres = shuffle(numeros_titres);
	}else{
		numeros_titres = numeros_titres.sort();
	}
	var html = '';
	var titre = numeros_titres[0][1];
	var html_video = "<video controls autoplay>" +
					"<source src=\"videos/" + numeros_titres[0][0] + ".mp4\" type=\"video/mp4\">" +
					"</video>";
	$("#video_container").empty();
	$("#video_container").append(html_video);				
	$(numeros_titres).each( function (index, value){
		if(index === 0){
			html += "<a class=\"thumb currentvid\" href=\"videos/" + value[0] + ".mp4\">" +
					"<img class=\"thumb\" src=\"images/" + value[0] + ".jpg\" alt=\"" + value[1] +  "\">" +
					"</a>";
		}else{
			html += "<a class=\"thumb\" href=\"videos/" + value[0] + ".mp4\">" +
					"<img class=\"thumb\" src=\"images/" + value[0] + ".jpg\" alt=\"" + value[1] +  "\">" +
					"</a>";
		}
	});
	$("#liste_videos").empty();
	$("#liste_videos").append(html);
	$("#titre_video").empty();
	$("#titre_video").append(titre);
	video_player();
	$('html,body').animate({ scrollTop: 435 }, 'slow');
}

function getPersonnagesActeurs(){
	$.ajax({
		url: "http://" + ipAddressCouchDb + "/kaamelott/_design/listes/_view/persos_acteurs",
		success: function (data){
        	var view = JSON.parse(data);
        	var persos = [];
       		var acteurs = [];                	           		           	
        	$(view.rows).each( function (index, item) {
        		persos.push(item.key);
       			acteurs.push(item.value);        	               	
       		});
        	displayLienPersonnagesActeurs(persos, acteurs);
        }             
	});
}

function displayLienPersonnagesActeurs(persos, acteurs){
	var html_persos = "";
	var html_acteurs = "";
	acteurs = acteurs.sort();
	$(persos).each( function(idx_perso, value_perso){
		html_persos += "<li><a href=\"javascript:void(0);\" onclick=\"parPerso('" + value_perso + "', true)\">" + value_perso + "</a></li>"
	});
	$(acteurs).each( function(idx_acteur, value_acteur){
		html_acteurs += "<li><a href=\"javascript:void(0);\" onclick=\"parActeur('" + value_acteur + "')\">" + value_acteur + "</a></li>"
	});
	html_persos += "<li class=\"clear\">&nbsp;</li>";
	html_acteurs += "<li class=\"clear\">&nbsp;</li>";
	$("#liste_personnages").empty();
	$("#liste_personnages").append(html_persos);
	$("#liste_acteurs").empty();
	$("#liste_acteurs").append(html_acteurs);
}

function shuffle(array) {
  	var currentIndex = array.length, temporaryValue, randomIndex;
  	// While there remain elements to shuffle...
  	while (0 !== currentIndex) {
    	// Pick a remaining element...
    	randomIndex = Math.floor(Math.random() * currentIndex);
    	currentIndex -= 1;
    	// And swap it with the current element.
    	temporaryValue = array[currentIndex];
    	array[currentIndex] = array[randomIndex];
    	array[randomIndex] = temporaryValue;
  	}
  	return array;
}

function getEpisodes(){	
	$.ajax({
		url: "http://" + ipAddressCouchDb + "/kaamelott/_design/listes/_view/Episodes_titres",
		success: function (data){
        	var view = JSON.parse(data);
        	var titres_persos = [];
        	var numeros = [];        
        	var ids = [];	           	
        	$(view.rows).each( function (index, item) {
                numeros.push(item.key);
                titres_persos.push(item.value);
                ids.push(item.id);
            });
            displayEpisodes(numeros, titres_persos, ids);
        }             
	});
}
			

function displayEpisodes(numeros, titres_persos, ids) {
    var html = "<table class=\"table\">";
    $(numeros).each( function (index, numero) {			               
        html += "<tr>";
        html+= "<td><a href=\"videos/" + numero + ".mp4\" target=\"_blank\">" + numero + "</a></td>";
        if(!edition){
        	html += "<td>" + titres_persos[index][1] + "</td>";
        	html += "<td>";        
    	}else{
        	html += "<td><input id=\"edit_titre_" + index + "\"class=\"form-control\" type=\"text\" value=\"" + titres_persos[index][1] + "\"></td>";		  
        	html += "<td><input id=\"edit_persos_" + index + "\"class=\"form-control\" type=\"text\" value=\"";
    	}
        $(titres_persos[index][2]).each( function(index_perso, nom_perso){
        	if(index_perso === 0){
        		html += nom_perso;
        	}else{
        		html += ", " + nom_perso  
        	}
        	});
        if(!edition){
        	html += "</td>";
    	}else{
        	html += "\"></td>"        
        	html += "<td><button class=\"btn btn-link\" onclick=\"editEpisode(" + index + ");\">Modifier</button>" +
        		  "<input type=\"hidden\" id=\"edit_rev_" + index + "\" value=\"" + titres_persos[index][0] + "\">" + 
        		  "<input type=\"hidden\" id=\"edit_id_" + index + "\" value=\"" + ids[index] + "\">" + 
        		  "<input type=\"hidden\" id=\"edit_numero_" + index + "\" value=\"" + numero + "\"></td>"
    	}
        html += "</tr>";
    });
    html += "</table>";

    if(edition && !already_new){
		var html_new_episode = "<form role=\"form\" class=\"form-inline\" onsubmit=\"return false;\">" +
		"<label for=\"numero_add\">N°</label>" +
		"<input class=\"form-control\" type=\"text\" name=\"numero\" value=\"\" id=\"numero_add\" size=\"6\" maxlength=\"8\" required>" +
		"<label for=\"titre_add\">Titre</label>" +
		"<input class=\"form-control\" type=\"text\" name=\"titre\" id=\"titre_add\" size=\"30\" value=\"\">" +
		"<button onclick=\"addEpisode();\" class=\"btn\">Ajouter</button>" +
		"</form>";
		$('#add-episode').empty();
		$('#add-episode').append(html_new_episode);
		already_new = true;
	}
    
    $('#episodes').empty();            
    $('#episodes').append(html);
}

function addEpisode() {		
	var numero = jQuery("#numero_add").val();
	var titre = jQuery("#titre_add").val();				
	var uuid = null;
	var item = null;
	if(titre != '' && numero != ''){
	$.ajax({
		type: "GET", 
		url: "http://" + ipAddressCouchDb + "/_uuids/",
		success: function (data) {
			item = JSON.parse(data);
			uuid = item.uuids;
			$.ajax({
			    type: "PUT",
			    url: "http://" + ipAddressCouchDb + "/kaamelott/" + uuid,
			    contentType: "application/json",
			    cache: "false", 
			    data: "{" + JSON.stringify("numero") + ":" + JSON.stringify(numero) + "," + JSON.stringify('titre') + ":" + JSON.stringify(titre) + "}"	,
			    success: function () {
			        getEpisodes();
			    },
			    fail: function(data){
			    	item = JSON.parse(data);
			    	$('#erreurs').empty();
			    	$('#erreurs').append("error: " + item.error + ", reason: " + item.reason);
			    }
			});
		},
		fail: function(data){
			item = JSON.parse(data);
			$('#erreurs').empty();
			$('#erreurs').append("error: " + item.error + ", reason: " + item.reason);
		}
	});	 
	} 
	jQuery("#numero_add").val('');
	jQuery("#titre_add").val('vide');				        				    
}

function editEpisode(index){
	var titre = $("#edit_titre_" + index).val();
	var numero = $("#edit_numero_" + index).val();
	var id_doc = $("#edit_id_" + index).val();
	var rev = $("#edit_rev_" + index).val();
	var persos = $("#edit_persos_" + index).val();
	var persos_tab = null;
	if(persos){
		persos_tab = persos.split(',');
		for(idx in persos_tab){
			persos_tab[idx] = persos_tab[idx].trim();
		}
	}else{
		persos_tab = [];
	}
	$.ajax({
	    type: "PUT",
	    url: "http://" + ipAddressCouchDb + "/kaamelott/" + id_doc,
	    contentType: "application/json",
	    cache: "false", 
	    data: "{" + JSON.stringify("_rev") + ":" + JSON.stringify(rev) + "," + JSON.stringify('numero') + ":" + JSON.stringify(numero) + "," + JSON.stringify('titre') + ":" + JSON.stringify(titre) + "," + JSON.stringify("personnages") + ":" + JSON.stringify(persos_tab) + "}"	,
	    success: function () {
	        getEpisodes();
	    },
	    fail: function(data){
	    	item = JSON.parse(data);
	    	$('#erreurs').empty();
	    	$('#erreurs').append("error: " + item.error + ", reason: " + item.reason);
	    }
	});
}

function getPersonnages(){
	$.ajax({
		url: "http://" + ipAddressCouchDb + "/kaamelott/_design/listes/_view/persos_acteurs",
		success: function (data){
            var view = JSON.parse(data);
            var persos = [];
            var acteurs = [];                	           		           	
            $(view.rows).each( function (index, item) {
               	persos.push(item.key);
               	acteurs.push(item.value);        	               	
            });
            displayPersonnages(persos, acteurs);
        }             
	});
}
			

function displayPersonnages(persos, acteurs) {
    var html = "<table class=\"table\" id=\"table_acteurs\"><tbody>";
    if(edition){
    	html += "<tr>";			        
    	html += "<td><input id=\"perso_add\"class=\"form-control\" type=\"text\" value=\"\"></td>";		  
    	html += "<td><input id=\"acteur_add\"class=\"form-control\" type=\"text\" value=\"\"></td>";			        			        
    	html += "</tr>";
	}
    $(persos).each( function (index, perso) {			               
        html += "<tr>";			    
        if(!edition){    
        	html += "<td>" + persos[index] + "</td>"
        	html += "<td>" + acteurs[index] + "</td>"
    	}else{
        	html += "<td><input id=\"edit_perso_" + index + "\"class=\"form-control\" type=\"text\" value=\"" + persos[index] + "\"></td>";		  
        	html += "<td><input id=\"edit_acteur_" + index + "\"class=\"form-control\" type=\"text\" value=\"" + acteurs[index] + "\"></td>";
    	}
        html += "</tr>";
    });			    
    html += "</tbody></table>";
    
    $('#persos').empty();            
    $('#persos').append(html);
}

function addPersonnage() {		
	var perso = jQuery("#perso_add").val();
	var acteur = jQuery("#acteur_add").val();				
	var rev = null;
	var item = null;						
	var listeJSON = formatListePersonnage();				        
	$.ajax({
	    type: "GET",
	    url: "http://" + ipAddressCouchDb + "/kaamelott/617fd0225e20055c08cd42ccb2001656",
	    contentType: "application/json",
	    cache: "false",				    
	    success: function (data) {
	    	item = JSON.parse(data);
	        rev = item._rev;				        				        				        				        
	        $.ajax({
	            type: "PUT",
	            url: "http://" + ipAddressCouchDb + "/kaamelott/617fd0225e20055c08cd42ccb2001656",
	            contentType: "application/json",
	            cache: "false", 
	            data: "{" + JSON.stringify("name") + ":" + JSON.stringify("liste_acteurs") + "," + JSON.stringify("_rev") + ":" + JSON.stringify(rev)
	            + "," + JSON.stringify("persos_acteurs") + ":" + listeJSON + "}"	,
	            success: function () {
	                getPersonnages();				                
	            },
	            fail: function(data){
	            	item = JSON.parse(data);
	            	$('#erreurs').empty();
	            	$('#erreurs').append("error: " + item.error + ", reason: " + item.reason);
	            }
	        });
	    },
	    fail: function(data){
	    	item = JSON.parse(data);
	    	$('#erreurs').empty();
	    	$('#erreurs').append("error: " + item.error + ", reason: " + item.reason);
	    }
	});
	
	jQuery("#perso_add").val('');
	jQuery("#acteur_add").val('');				        				    
}			

function formatListePersonnage(){
	var listeJSON = '[';
	var table_acteurs = document.getElementById("table_acteurs"),				
	td_input = null,
	tds = table_acteurs.getElementsByTagName("td");					
	for(idx in tds){
		if(tds[idx].innerHTML != undefined){
			td_input = tds[idx].getElementsByTagName("input")[0];
			if(td_input.value != ""){
				if(idx%2 == 0){
					listeJSON += "[\"" + td_input.value + "\"";
				}else{
					listeJSON += "\"" + td_input.value + "\"]";
				}
				listeJSON += ",";
			}
		}
	}	
	listeJSON = listeJSON.substring(0, listeJSON.length-1);
	listeJSON += "]";
	return listeJSON;
}

function toggle_edit_episode(){
	edition = !edition;
	$("#lien-edit").empty();
	if(edition){
		$("#lien-edit").append("<a href=\"javascript:void(0);\" onclick=\"toggle_edit_episode();\">Arrêter l'édition</a>");
	}else{
		$("#lien-edit").append("<a href=\"javascript:void(0);\" onclick=\"toggle_edit_episode();\">Editer</a>");
	}
	$("#add-episode").empty();	
	$("#episodes").empty();
	getEpisodes();
}

function toggle_edit_personnages(){
	edition = !edition;
	$("#lien-edit").empty();
	if(edition){
		$("#lien-edit").append("<a href=\"javascript:void(0);\" onclick=\"toggle_edit_personnages();\">Arrêter l'édition</a>");
	}else{
		$("#lien-edit").append("<a href=\"javascript:void(0);\" onclick=\"toggle_edit_personnages();\">Editer</a>");
	}
	$("#send").empty();	
	if(edition){
		$("#send").append("<button class=\"btn\" onclick=\"addPersonnage();\">Enregistrer les modifications</button>");
	}
	$("#persos").empty();
	getPersonnages();
}