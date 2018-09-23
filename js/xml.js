function getXMLFromFile(fileName){
	var xmlhttp, xmlDoc;
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", fileName, false);
	xmlhttp.send();
	xmlDoc = $( xmlhttp.responseXML );		
	return xmlDoc;
}

function getLang(){	
	var xmllang = getXMLFromFile('xml/config.xml');
	return xmllang.find("language").text();	
}

function getTraduction(stringName){
	var xmlDocString = getXMLFromFile('xml/strings.xml');
	$("#" + stringName).html(xmlDocString.find(stringName).find(getLang()).text());
}

function getStrings(){	
	getTraduction("home");
	getTraduction("episodes");
	getTraduction("characters");
}