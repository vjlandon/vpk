/*
Copyright 2018 Dave Weilert

Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
and associated documentation files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial 
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//----------------------------------------------------------
// build svg data from returned data
//----------------------------------------------------------
let svgInfo = {};            // array of information for tool tips
let iCnt = 1;
let oldNS = '@';
let first = true;
let evtCnt = 1000;
let partsCnt = 1000;
let rdata = '';
let breakData = '';
let breakID = 100;
let height = 0;
let fnum;
let genS;
let cfgS;
let iamS;
let podS;
let netS;
let pvcS;
let genH;
let cfgH;
let iamH;
let podH;
let netH;
let pvcH;
let allH;
let outterName = '';
let cBar = false;
let wCnt = 0;
let cLevel = '';

function initVars() {
	svgInfo = {};            // array of information for tool tips
    iCnt = 1;
    oldNS = '@';
    first = true;
    evtCnt = 1000;
    partsCnt = 1000;
    rdata = '';
    breakData = '';
    breakID = 100;
    height = 0;
    fnum;
    genS;
    cfgS;
    iamS;
    podS;
    netS;
    pvcS;
    genH;
    cfgH;
    iamH;
    podH;
    netH;
    pvcH;
    allH;
    outterName = '';
    cBar = false;
	wCnt = 0;
	cLevel = '';
}

function schematic(baseDir) {

	initVars();

    $("#schematicDetail").hide();
    $("#schematicDetail").empty();
    $("#schematicDetail").html('');

	cLevel = buildClusterLevel();

	let html = buildCSVG();	

	if (wCnt === 0) {
		html = '<div class="vpkfont"><br><p>No workload schematics generated for the selected datasource</p></div>'
	}

	$("#schematicDetail").html(cLevel + html);
    $("#schematicDetail").show();
}

function buildClusterLevel() {
	return nsChange('clusterLevel')
}

function buildCSVG() {
	svgInfo = {};
	let keys = Object.keys(k8cData);
	//console.log('schematic keys located: ' + keys.length)
	let newKeys = [];
	let newKey;
	
	for (let p = 0; p < keys.length; p++) {
		newKey = keys[p];
		if (k8cData[newKey].display === true) {
			newKeys.push({'namespace': k8cData[newKey].namespace, 'fnum': newKey});
		} else {
			//newKeys.push({'namespace': k8cData[newKey].namespace, 'fnum': newKey});
		}
	}	

    // sort by namespace & kind
    newKeys.sort((a, b) => (a.namespace > b.namespace) ? 1 : (a.namespace === b.namespace) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );

	// clear the old unsorted keys
	keys = [];  

	// build new sorted array: keys
	for (let t = 0; t < newKeys.length; t++) {
		newKey = newKeys[t].fnum;
		keys.push(newKey);
	}

	// process data 
	for (let k = 0; k < keys.length; k++) {
		evtCnt++;
		fnum = keys[k];
		if (fnum.startsWith('0000-')) {
			continue;   
		} else {
			wCnt++  // increment the workload found counter
		}

		if (k8cData[fnum].namespace !== oldNS) {
			oldNS = k8cData[fnum].namespace;
			breakID++;
			if (first) {
				first = false;
				rdata = rdata + '<span class="breakBar vpkcolor"><hr>' 
				+ '&nbsp;&nbsp;Press the buttons below to show or hide the schematics for the listed namespaces' 
				+ '<hr><span>';
			} else {
				rdata = rdata + '</div>'
			}
			// output the break bar
			breakData = 
			  '<div class="breakBar"><button type="button" ' 
			+ ' class="btn btn-primary btn-sm vpkButtons" data-toggle="collapse" data-target="#collid-' 
			+ breakID + '">&nbsp;&nbsp;' + k8cData[fnum].namespace + '&nbsp;&nbsp;</button>'
			+ '&nbsp;&nbsp;<hr></div>'
			+ '<div id="collid-' + breakID + '" class="collapse">';

			let nsWide = nsChange(oldNS);

			rdata = rdata + breakData + nsWide;
		}
		let acb = process(fnum);
		rdata = rdata + acb;
	}
	rdata = rdata + '</div>'
	return rdata
}

function nsChange(ns) {
	
	let nsKey = '0000-' + ns;
	let titleNS = '';
	if (ns === 'clusterLevel') {
		titleNS = 'at Cluster level'
	} else {
		titleNS = 'in namespace "' + ns + '"'; 
	}
	partsCnt++;
	let partsBar = '<div class="partsBar"><button type="button" ' 
	+ ' class="btn btn-secondary btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ partsCnt + '">&nbsp;&nbsp;Press to toggle viewing the complete list of Resources used ' + titleNS + '&nbsp;&nbsp;</button>'
	+ '</div>'
	+ '<div id="parts-' + partsCnt + '" class="collapse">'

	let bottomButton = '&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" ' 
	+ ' class="btn btn-secondary btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ partsCnt + '">&nbsp;&nbsp;Close Resource list&nbsp;&nbsp;</button>'

	let divSection = '<div class="events" ><hr><table style="width:100%">'
	let header = '<tr class="partsList"><th>API Version</th><th>Kind</th><th>Resource Name</th><th>ID # (click ID # to view)</th></tr>'
	let nsHtml = '';
	let keys;
	let key;
	let k;
	let d;
	let hl;
	let item;
	let rtn = '';
	let name;
	let fnum;
	let parts;
	let parm;
	let fname;
	let api;
	if (typeof k8cData[nsKey] !== 'undefined'){
		rtn = partsBar + divSection;
		keys = Object.keys(k8cData[nsKey]);
		keys.sort();

		for (k = 0; k < keys.length; k++) {
			key = keys[k];
			if (key === 'display') {
				continue;
			}
			nsHtml = header;
			parts = k8cData[nsKey][key];
			let nArray = [];
			//parts.sort( (a, b) => (a.name > b.name) ? 1 : (a.name === b.name) );
			hl = parts.length;
			for (d = 0; d < hl; d++) {
				nArray.push(parts[d].name+'#@@#'+parts[d].fnum+'#@@#'+parts[d].api);
			}
			nArray.sort();
			parts = []
			for (d = 0; d < hl; d++) {
				let bits = nArray[d].split('#@@#');
				parts.push({'name': bits[0], 'fnum': bits[1], 'api': bits[2]});
			}

			for (d = 0; d < hl; d++) {
				name = parts[d].name;
				api = parts[d].api;
				fnum = parts[d].fnum;
				let fParts = fnum.split('.');
				fname = baseDir + '/config' + fParts[0] + '.yaml';
				parm = fname + '::' + fParts[1] + '::' + name;
				item = '<tr>' 
				+ '<td width="25%">' + api + '</td>' 
				+ '<td width="15%">' + key + '</td>' 
				+ '<td width="47%">' + name + '</td>' 
				+ '<td width="13%"><span onclick="getDef(\'' + parm + '\')">' + fnum + '</span></td>'
				+ '</tr>';
				nsHtml = nsHtml + item
			}
			if (nsHtml !== header) {
				rtn = rtn + nsHtml;
			}
		}
		
		rtn = rtn + '</table><hr>' + bottomButton + '</div></div>';
	}

	//if (ns !== 'clusterLevel') {
		// build the role and roleBinding sections
		let bRoles = buildRoles(ns);
		if (typeof bRoles !== 'undefined') {
			rtn = rtn + bRoles;
		}

	if (ns !== 'clusterLevel') {
		let bBindings = buildRoleBindings(ns);
		if (typeof bBindings !== 'undefined') {
			rtn = rtn + bBindings;
		}

		let saData = buildSA(ns);
		if (typeof saData !== 'undefined') {
			rtn = rtn + saData;
		}
	}	
	return rtn;
}

function parseArray(data) {
	nData = '';
	if (typeof data === 'undefined' || data === '') {
		return nData;
	}

	for (let i = 0; i < data.length; i++) {
		nData = nData + data[i] + '<br>'; 
	}
	return nData;
}

function parseSubject(data) {
	nData = '';
	if (typeof data === 'undefined' || data === '') {
		return nData;
	}
	let hl = data.length;

	for (let i = 0; i < hl; i++) {
		if (typeof data[i].name !== 'undefined' ) {
			if (typeof data[i].kind !== 'undefined' ) {
				if (data[i].kind === 'ServiceAccount' ) {
					nData = nData + 'Name: <span class=" text-light bg-info">' + data[i].name + '</span><br>';
				} else if (data[i].kind === 'Group' ) {
					nData = nData + 'Name: <span class=" bg-warning">' + data[i].name + '</span><br>';
				} else if (data[i].kind === 'User' ) {
					nData = nData + 'Name: <span class=" text-light bg-danger">' + data[i].name + '</span><br>';
				} else if (data[i].kind === 'SystemGroup' ) {
					nData = nData + 'Name: <span class=" text-light bg-primary">' + data[i].name + '</span><br>';
				} else if (data[i].kind === 'SystemUser' ) {
					nData = nData + 'Name: <span class=" text-light bg-secondary">' + data[i].name + '</span><br>';
				} else {
					nData = nData + 'Name: ' + data[i].name + '<br>';
					console.log('Unmanaged kind for Subject: ' + data[i].kind)
				}
			} else {
				nData = nData + 'Name: ' + data[i].name + '<br>';
			}
		}
		if (typeof data[i].kind !== 'undefined' ) {
			nData = nData + 'Kind: ' + data[i].kind + '<br>';
		}
		if (hl === 1 || i === (hl - 1) ) {
			//
		} else {
			nData = nData + '<hr>';
		}
	}
	return nData;
}


function buildSA(ns) {
	
	let nsKey = '0000-' + ns;
	// check if there are any role entries to process
	if (typeof k8cData[nsKey].ServiceAccount === 'undefined') {
		return
	}
	partsCnt++;
	let partsBar = '<div class="partsBar"><button type="button" ' 
	+ ' class="btn btn-secondary btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ partsCnt + '">&nbsp;&nbsp;Press to toggle viewing the complete ServiceAccount detail for namespace: ' + ns + '&nbsp;&nbsp;</button>'
	+ '</div>'
	+ '<div id="parts-' + partsCnt + '" class="collapse">';
	let bottomButton = '&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" ' 
	+ ' class="btn btn-secondary btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ partsCnt + '">&nbsp;&nbsp;Close ServiceAccount list&nbsp;&nbsp;</button>';
	let divSection = '<div class="events" ><hr><table style="width:100%">';
	let header = '<tr class="partsList"><th>Service Account name</th><th>ID # (click to view)</th></tr>';

	//data to show
	let accounts = k8cData[nsKey].ServiceAccount;
	accounts.sort((a, b) => (a.name > b.name) ? 1 : (a.names === b.name) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );

	let account;
	let hl = accounts.length;
	let nsHtml = '';
	let item;
	let rtn = '';
	let name;
	let fnum;
	let parm;
	let fname;
	rtn = partsBar + divSection + header;


	for (r = 0; r < hl; r++) {
		account = accounts[r];
		name = account.name;

		fnum = account.fnum;
		let fParts = fnum.split('.');
		fname = baseDir + '/config' + fParts[0] + '.yaml';
		parm = fname + '::' + fParts[1] + '::' + name;

		item = '<tr>' 
		+ '<td width="50%"  class="align-top"> <span class=" text-light bg-info">' + name + '</span></td>' 
		+ '<td width="50%"  class="align-top" ><span onclick="getDef(\'' + parm + '\')">' + fnum + '</span></td>'
		+ '</tr>';
		nsHtml = nsHtml + item
		item = '<tr>' 
		+ '<td width="50%"><hr></td>' 
		+ '<td width="50%"><hr></td>' 
		+ '</tr>';
		nsHtml = nsHtml + item		

	}
	if (nsHtml !== header) {
		rtn = rtn + nsHtml;
	}
	
	
	rtn = rtn + '</table><hr>' + bottomButton + '</div></div>';

	if (rtn.indexOf('undefined') > -1) {
		console.log(rtn);
	}

	return rtn;
}


// role bindings 
function buildRoleBindings(ns) {
	
	let nsKey = '0000-' + ns;
	// check if there are any role entries to process
	if (typeof k8cData[nsKey].RoleBinding === 'undefined') {
		return
	}
	partsCnt++;
	let partsBar = '<div class="partsBar"><button type="button" ' 
	+ ' class="btn btn-secondary btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ partsCnt + '">&nbsp;&nbsp;Press to toggle viewing the complete RoleBinding detail for namespace: ' + ns + '&nbsp;&nbsp;</button>'
	+ '</div>'
	+ '<div id="parts-' + partsCnt + '" class="collapse">';
	let bottomButton = '&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" ' 
	+ ' class="btn btn-secondary btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ partsCnt + '">&nbsp;&nbsp;Close RoleBinding list&nbsp;&nbsp;</button>';
	let divSection = '<div class="events" ><hr><table style="width:100%">';
	let header = '<tr class="partsList"><th>RoleBinding name</th><th>Role name</th><th>Subject Info</th><th>ID # (click to view)</th></tr>';

	//data to show
	let bindings = k8cData[nsKey].RoleBinding;
	bindings.sort((a, b) => (a.name > b.name) ? 1 : (a.names === b.name) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );

	let bind;
	let hl = bindings.length;
	let nsHtml = '';
	let item;
	let rtn = '';
	let name;
	let fnum;
	let subject;
	let roleName;
	let parm;
	let fname;
	rtn = partsBar + divSection + header;


	for (r = 0; r < hl; r++) {
		bind = bindings[r];
		name = bind.name;
		subject = '';
		roleName = '';
		if (typeof bind.roleRef !== 'undefined') {
			if (typeof bind.roleRef.name !== 'undefined') {
				roleName = bind.roleRef.name;
			}
		}

		fnum = bind.fnum;
		let fParts = fnum.split('.');
		fname = baseDir + '/config' + fParts[0] + '.yaml';
		parm = fname + '::' + fParts[1] + '::' + name;

		subject = parseSubject(bind.subjects);


		item = '<tr>' 
		+ '<td width="27%"  class="align-top" >' + name + '</td>' 
		+ '<td width="30%"  class="align-top"><span class=" text-light bg-success">' + roleName + '<span></td>' 
		+ '<td width="30%"  class="align-top" >' + subject + '</td>' 
		+ '<td width="13%"  class="align-top" ><span onclick="getDef(\'' + parm + '\')">' + fnum + '</span></td>'
		+ '</tr>';
		nsHtml = nsHtml + item
		item = '<tr>' 
		+ '<td width="25%"><hr></td>' 
		+ '<td width="25%"><hr></td>' 
		+ '<td width="25%"><hr></td>' 
		+ '<td width="25%"><hr></td>' 
		+ '</tr>';
		nsHtml = nsHtml + item		

	}
	if (nsHtml !== header) {
		rtn = rtn + nsHtml;
	}
	
	
	rtn = rtn + '</table><hr>' + bottomButton + '</div></div>';

	if (rtn.indexOf('undefined') > -1) {
		console.log(rtn);
	}

	return rtn;
}



// roles
function buildRoles(ns) {
	
	let nsKey = '0000-' + ns;
	// check if there are any role entries to process
	if (typeof k8cData[nsKey].Role === 'undefined') {
		return
	}
	partsCnt++;
	let partsBar = '<div class="partsBar"><button type="button" ' 
	+ ' class="btn btn-secondary btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ partsCnt + '">&nbsp;&nbsp;Press to toggle viewing the complete Role detail for namespace: ' + ns + '&nbsp;&nbsp;</button>'
	+ '</div>'
	+ '<div id="parts-' + partsCnt + '" class="collapse">';
	let bottomButton = '&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" ' 
	+ ' class="btn btn-secondary btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ partsCnt + '">&nbsp;&nbsp;Close Role list&nbsp;&nbsp;</button>';
	let divSection = '<div class="events" ><hr><table style="width:100%">';
	let header = '<tr class="partsList"><th>Role name</th><th>API Groups</th><th>Resource Names</th><th>Resources</th><th>Verbs</th><th>ID # (click to view)</th></tr>';

	//data to show
	let roles = k8cData[nsKey].Role;
	roles.sort((a, b) => (a.name > b.name) ? 1 : (a.names === b.name) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );

	let role;
	let hl = roles.length;
	let nsHtml = '';
	let item;
	let rtn = '';
	let name;
	let apiG ;
	let fnum;
	let resourceNames;
	let resources;
	let verbs;
	let parm;
	let fname;
	rtn = partsBar + divSection + header;

	for (r = 0; r < hl; r++) {
		apiG = '';
		resourceNames = '';
		resources = '';
		verbs = '';
		role = roles[r];
		name = role.name;

		fnum = role.fnum;
		let fParts = fnum.split('.');
		fname = baseDir + '/config' + fParts[0] + '.yaml';
		parm = fname + '::' + fParts[1] + '::' + name;
		item = '<tr>' 
		+ '<td width="20%" class="top"><span class=" text-light bg-success">' + name + '</span></td>' 
		+ '<td width="20%">&nbsp;</td>' 
		+ '<td width="20%">&nbsp;</td>' 
		+ '<td width="20%">&nbsp;</td>' 
		+ '<td width="7%">&nbsp;</td>' 
		+ '<td width="13%"><span onclick="getDef(\'' + parm + '\')">' + fnum + '</span></td>'
		+ '</tr>';
		nsHtml = nsHtml + item
		item = '<tr>' 
		+ '<td width="20%"><hr></td>' 
		+ '<td width="20%"><hr></td>' 
		+ '<td width="20%"><hr></td>' 
		+ '<td width="20%"><hr></td>' 
		+ '<td width="7%"><hr></td>' 
		+ '<td width="13%"><hr></td>'
		+ '</tr>';
		nsHtml = nsHtml + item		

		for (let c = 0; c < role.rules.length; c++) {
			if (typeof role.rules[c].apiGroup !== 'undefined') {
				apiG = parseArray(role.rules[c].apiGroup);
			}
			if (typeof role.rules[c].resourceNames !== 'undefined') {
				apiG = parseArray(role.rules[c].resourceNames);
			}
			if (typeof role.rules[c].resources !== 'undefined') {
				resources = parseArray(role.rules[c].resources);
			}
			if (typeof role.rules[c].verbs !== 'undefined') {
				verbs = parseArray(role.rules[c].verbs);
			}

			item = '<tr>' 
			+ '<td width="20%">&nbsp;</td>' 
			+ '<td width="20%" class="align-top ">' + apiG + '</td>' 
			+ '<td width="20%" class="align-top ">' + resourceNames + '</td>' 
			+ '<td width="20%" class="align-top ">' + resources + '</td>' 
			+ '<td width="10%" class="align-top">' + verbs + '</td>' 
			+ '<td width="10%">&nbsp;</td>'
			+ '</tr>';
			nsHtml = nsHtml + item

			item = '<tr>' 
			+ '<td width="20%"><hr></td>' 
			+ '<td width="20%"><hr></td>' 
			+ '<td width="20%"><hr></td>' 
			+ '<td width="20%"><hr></td>' 
			+ '<td width="10%"><hr></td>' 
			+ '<td width="10%"><hr></td>'
			+ '</tr>';
			nsHtml = nsHtml + item

		}

	}
	if (nsHtml !== header) {
		rtn = rtn + nsHtml;
	}
	
	
	rtn = rtn + '</table><hr>' + bottomButton + '</div></div>';
	// build the roleBinding sections
	if (rtn.indexOf('undefined') > -1) {
		console.log(rtn);
	}

	return rtn;
}



function process(fnum) {
	cBar = false;
	genS = 0;
	cfgS = 0;
	iamS = 0;
	podS = 0;
	netS = 0;
	pvcS = 0;

	genH = 0;
	cfgH = 0;
	iamH = 0;
	podH = 0;
	netH = 0;
	pvcH = 0;

	allH = 0;
	height = 0;
	outterName = 'No defined workload name';
	html = '';
	// config
	let rtnConfig = svgConfig(k8cData[fnum], fnum);
	if (rtnConfig.bnds.show === true ) {
		cfgS = 50;
		html = html + '<g id="config-' + fnum + '" transform="translate(350, ' + cfgS + ')">' + rtnConfig.rtn + '</g>';
		cfgH = rtnConfig.bnds.height;
	}

	// generators
	let rtnGen = svgGenerators(k8cData[fnum], fnum);
	if (rtnGen.bnds.show === true ) {
		if (cfgS > 0) {
			genS = cfgS + cfgH + 50;
		} else {
			genS = 50;
		}

		if (rtnGen.bnds.width > 150) {
			html = html + '<g id="gen-' + fnum + '" transform="translate(50, ' +  genS + ')">' + rtnGen.rtn + '</g>'
		} else {

			html = html + '<g id="gen-' + fnum + '" transform="translate(50, ' +  genS + ')">' + rtnGen.rtn + '</g>'
		}
		genH = height + rtnGen.bnds.height;
		if (rtnGen.bnds.crev === true ) {
		 	genH = genH + 50;
		}
	}

	// network
	let rtnNet = svgNetwork(k8cData[fnum], fnum);
	if (rtnNet.bnds.show === true ) {
		if (cfgH > 0) {
			if (genH > 0) {
				netS = cfgS + cfgH + genH + 100;
			} else {
				netS = cfgS + cfgH + 50;
			}
		} else {
			if (genH > 0) {
				netS = genS + genH + 50;
			} else {
				netS = 50;
			}
		} 
		html = html + '<g id="net-' + fnum + '" transform="translate(50, ' + netS + ')">' + rtnNet.rtn + '</g>'
		netH = height + rtnNet.bnds.height;
	}

	// security / IAM
	let rtnIAM = svgIAM(k8cData[fnum], fnum);
	if (rtnIAM.bnds.show === true ) {
		if (cfgS > 0) {
			iamS = cfgS + cfgH + 50;;
		} else {
			iamS = 50;
		}
		html = html + '<g id="iam-' + fnum + '" transform="translate(650, ' +  iamS + ')">' + rtnIAM.rtn + '</g>'
		iamH = height + rtnIAM.bnds.height;
	}

	// PVC
	let rtnPvc = svgPVC(k8cData[fnum], fnum);
	if (rtnPvc.bnds.show === true ) {
		if (cfgH > 0) {
			if (iamH > 0) {
				pvcS = cfgS + cfgH + iamH + 100;
			} else {
				pvcS = cfgS + cfgH + 50;
			}
		} else {
			if (iamH > 0) {
				pvcS = cfgS + cfgH + 50;
			} else {
				pvcS = 50;
			}
		} 
		html = html + '<g id="pvc-' + fnum + '" transform="translate(650, ' + pvcS + ')">' + rtnPvc.rtn + '</g>'
		pvcH = height + rtnPvc.bnds.height;
	}


	let lH = 0;
	let rH = 0;

	// pod
	if (genH > 0) {
		if (netH > 0) {
			lH = genH + netH + 50;
		}
	}
	if (iamH > 0) {
		if (pvcH > 0) {
			rH = iamH + pvcH + 50;
		}
	}
	if (rH > lH) {
		height = rH;
	} else {
		height = lH;
	}


	let rtnPod = svgPod(k8cData[fnum], fnum, height);
	if (rtnPod.bnds.show === true ) {
		outterName = rtnPod.outterName;
		if (cfgS > 0) {
			podS = cfgS + cfgH + 50;
		} else {
			podS = 50;
		}
		html = html + '<g id="pod-' + fnum + '" transform="translate(350, ' + podS + ')">' + rtnPod.rtn + '</g>';
		podH = rtnPod.bnds.height;
	}

	// calculate outter box size
	let maxL = 0;
	let maxM = 0;
	let maxR = 0;

	// calc left max
	if (cfgH > 0) {
		if (genH > 0) {
			if (netH > 0) {
				height = cfgH + genH + netH + 200;
				maxL = height;
			} else {
				height = cfgH + 100;
				maxL = height;
			}
		} else {
			if (netH > 0) {
				height = cfgH + netH + 150;
				maxL = height;
			} else {
				height = cfgH + 100;
				maxL = height;
			}
		}
	} else {
		if (genH > 0) {
			if (netH > 0) {
				height = genH + netH + 150;
				maxL = height;
			} else {
				height = genH + 100;
				maxL = height;
			}
		} else {
			if (netH > 0) {
				height = netH + 100;
				maxL = height;
			} else {
				height = 0;
				maxL = height;
			}
		}
	}

	// calc middle max
	if (cfgH > 0) {
		if (podH > 0) {
			height = cfgH + podH + 200;
			maxM = height;
		} else {
			height = cfgH + 100;
			maxM = height;
		}
	} else {
		if (podH > 0) {
			height = podH + 150;
			maxM = height;
		} else {
			height = 0;
			maxM = height;
		}
	}

	// calc right max
	if (cfgH > 0) {
		if (iamH > 0) {
			if (pvcH > 0) {
				height = cfgH + iamH + pvcH + 200;
				maxR = height;
			} else {
				height = cfgH + iamH + 150;
				maxR = height;
			}
		} else {
			if (pvcH > 0) {
				height = cfgH + pvcH + 150;
				maxR = height;
			} else {
				height = cfgH + 100;
				maxR = height;
			}
		}
	} else {
		if (iamH > 0) {
			if (pvcH > 0) {
				height = iamH + pvcH + 150;
				maxR = height;
			} else {
				height = iamH + 100;
				maxR = height;
			}
		} else {
			if (pvcH > 0) {
				height = pvcH + 100;
				maxr = height;
			} else {
				height = 0;
				maxR = height;
			}
		}
	}

	height = maxL;
	if (maxM > height) {
		height = maxM;
	}
	if (maxR > height) {
		height = maxR;
	}

	if (rtnPvc.bnds.clusterBar === true) {
		html = html 
		+ '<rect  x="875" y="0" width="250" height="' 
		+ height 
		+ '" rx="15" stroke-dasharray="1, 2" stroke-width="1"  stroke="black" fill="none"/>'
		//+ '<line x1="875" y1="0" x2="875" y2="' + height + '" stroke-width="1"  stroke="black" stroke-linecap="round" stroke-dasharray="5, 5"/>'
		+ '<text x="900" y="25" class="workloadText">Cluster level resources</text>'
		+ '<text x="900" y="40" class="pickIcon">(Click icon to view detail)</text>'

	}

	let outterBox = '<g>'
	+ '<rect  x="5" y="0" width="845" height="' 
	+ height 
	+ '" rx="15" stroke-dasharray="1, 2" stroke-width="1"  stroke="black" fill="none"/>'
	+ '<text x="15" y="25" class="workloadText">Workload: ' 
	+ outterName 
	+ '</text>'
	+ '<text x="15" y="40" class="pickIcon">(Click icon to view detail)&nbsp;&nbsp;' + fnum + '</text>'
	+ '</g>'
	html = html + outterBox;	

	let nBar = '<div class="eventBar"><button type="button" ' 
	+ ' class="btn btn-warning btn-sm vpkButtons" data-toggle="collapse" data-target="#events-' 
	+ evtCnt + '">&nbsp;&nbsp;Press to toggle viewing of events for ' + k8cData[fnum].name + '&nbsp;&nbsp;</button>'
	+ '&nbsp;&nbsp;</div>'
	+ '<div id="events-' + evtCnt + '" class="collapse">'

	if (typeof k8cData[fnum].Events !== 'undefined') {
		let evts = k8cData[fnum].Events;
		let hl = evts.length;
		if (hl > 0) {
			let msg;
			let evtHtml = '<div class="events" ><hr><table style="width:100%"><tr><th>Type</th><th>Reason</th><th>Object</th>' 
			+ '<th>Message</th><th>Occurences</th></tr>'
			for (let e = 0; e < hl; e++) {



				msg = '<tr>' 
				+ '<td width="5%">'  + evts[e].type + '</td>' 
				+ '<td width="5%">' + evts[e].reason + '</td>' 
				+ '<td width="20%">' + evts[e].kind+'/'+evts[e].name + '</td>' 
				+ '<td width="50%">' + evts[e].message + '</td>'
				+ '<td width="20%">First time: ' + formatDate(evts[e].firstTime) + '<br>Last time: ' + formatDate(evts[e].lastTime) + '<br>' + 'Count: ' + evts[e].count + '</td>' 
				+ '</tr>'
				evtHtml = evtHtml + msg
				evts[e].used = true;
			}
			k8cData[fnum].Events = evts;

			evtHtml = evtHtml + '</table><hr></div>';
			rdata = rdata + nBar + evtHtml + '</div>'
		}
	}

	iCnt++;
	height = height + 50;  // adding visual space between svg
	html = '<svg id="fnum-' + fnum + '" width="1285" height="' + height + '">' +  html + '</svg>';
	return html;
}

function formatDate(data) {
	if (typeof data === 'undefined' || data === null) {
		return 'Unknown date';
	}
	let mydate = new Date(data);
	let fDate = mydate.toDateString();
	let tPart = data.split('T')
	if (typeof tPart[1] !== 'undefined') {
		fDate = fDate + ' ' + tPart[1]
		if (fDate.endsWith('Z')) {
			fDate = fDate.substring(0, fDate.length - 1) + ' GMT'
		}	
	}

	return fDate;
}

function show(what, cfg, gen, net, iam, pvc, pod) {
	console.log(what + ' ::  cfg: ' + cfg + '  gen: ' + gen + '  net: ' + net + '  iam: ' + iam
					 +    '  pvc: ' + pvc + '  pod: ' + pod ) ;
}


function svgPVC(data, fnum) {
	let rectP1a = '<rect  x="0" y="0" width="';
	let rectP1b = '" height="';
	let rectP2 = '" rx="15" stroke-dasharray="1, 2" stroke-width="1"  stroke="black" fill="#fcdc79"/>';
	let rectH = 0;
	let rectW = 0	
	let rtn = '';
	let bnds = {'height': 0, 'width': 150, 'show': false, 'clusterBar': false};
	// config PVC
	if (typeof data.PersistentVolumeClaim !== 'undefined') {
		bnds.height = bnds.height + 100;
		rectH = rectH + 100;
		rectW = rectW + 150;
		bnds.show = true;
		rtn = rtn
		+ '<image x="50"  y="25" width="50"  height="50" href="images/k8/pvc.svg" onmousemove="showTooltip(evt, \'' 
		+ buildSvgInfo(data.PersistentVolumeClaim, fnum, 'PersistentVolumeClaim') 
		+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'PVC@' +  fnum +'\')"/>' 
		+ '<line  x1="50" x2="-50" y1="50" y2="50" stroke="black" stroke-width="2" stroke-linecap="round"/>'
		+ '<line  x1="50" x2="45" y1="50"  y2="45" stroke="black" stroke-width="2" stroke-linecap="round"/>'
		+ '<line  x1="50" x2="45" y1="50"  y2="55" stroke="black" stroke-width="2" stroke-linecap="round"/>';

		if (data.PersistentVolumeClaim[0].pvName !== '') {
			rectW = rectW + 200;
			bnds.clusterBar = true;
			rtn = rtn
			+ '<image x="250"  y="25" width="50"  height="50" href="images/k8/pv.svg" onmousemove="showTooltip(evt, \'' 
			+ buildSvgInfo(data.PersistentVolumeClaim, fnum, 'PersistentVolume') 
			+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'PersistentVolume@' +  data.PersistentVolumeClaim[0].pvFnum +'\')"/>' 
			+ '<line  x1="50" x2="-50" y1="50" y2="50" stroke="black" stroke-width="2" stroke-linecap="round"/>'
			+ '<line  x1="50" x2="45" y1="50"  y2="45" stroke="black" stroke-width="2" stroke-linecap="round"/>'
			+ '<line  x1="50" x2="45" y1="50"  y2="55" stroke="black" stroke-width="2" stroke-linecap="round"/>';
		}

		if (data.PersistentVolumeClaim[0].storageClassName !== '') {
			rectW = rectW + 75;
			bnds.clusterBar = true;
			rtn = rtn
			+ '<image x="350"  y="25" width="50"  height="50" href="images/k8/sc.svg" onmousemove="showTooltip(evt, \'' 
			+ buildSvgInfo(data.PersistentVolumeClaim, fnum, 'StorageClass') 
			+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'StorageClass@' +  data.PersistentVolumeClaim[0].storageClassFnum +'\')"/>' 
			+ '<line  x1="50" x2="-50" y1="50" y2="50" stroke="black" stroke-width="2" stroke-linecap="round"/>'
			+ '<line  x1="50" x2="45" y1="50"  y2="45" stroke="black" stroke-width="2" stroke-linecap="round"/>'
			+ '<line  x1="50" x2="45" y1="50"  y2="55" stroke="black" stroke-width="2" stroke-linecap="round"/>';
		}

		if (bnds.show = true) {
			rtn = rectP1a + rectW + rectP1b + rectH + rectP2 + rtn;
		};

	}
	return {'bnds': bnds, 'rtn': rtn}
}


function svgIAM(data, fnum) {
	let rectP1 = '<rect  x="0" y="0" width="150" height="' 
	let rectP2 = '" rx="15" stroke-dasharray="1, 2" stroke-width="1"  stroke="black" fill="#bfffda"/>'
	let rectH = 0;	
	let rtn = '';
	let bnds = {'height': 0, 'width': 250, 'show': false};
	// config ServiceAccounts
	if (typeof data.ServiceAccount !== 'undefined') {
		bnds.height = bnds.height + 100;
		rectH = rectH + 100;
		bnds.show = true;
		rtn = rtn
		+ '<image x="50"  y="25" width="50"  height="50" href="images/k8/sa.svg" onmousemove="showTooltip(evt, \'' 
		+ buildSvgInfo(data.ServiceAccount, fnum, 'ServiceAccount') 
		+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'ServiceAccount@' +  fnum +'\')"/>' 
		+ '<line  x1="50" x2="-50" y1="50" y2="50" stroke="black" stroke-width="2" stroke-linecap="round"/>'
		+ '<line  x1="50" x2="45" y1="50"  y2="45" stroke="black" stroke-width="2" stroke-linecap="round"/>'
		+ '<line  x1="50" x2="45" y1="50"  y2="55" stroke="black" stroke-width="2" stroke-linecap="round"/>';
		
		if (bnds.show = true) {
			rtn = rectP1 + rectH + rectP2 + rtn;
		};
	}
	return {'bnds': bnds, 'rtn': rtn}
}


function svgNetwork(data, fnum) {
	let rectP1 = '<rect  x="0" y="0" width="250" height="' 
	let rectP2 = '" rx="15" stroke-dasharray="1, 2" stroke-width="1"  stroke="black" fill="lightblue"/>'
	let rectH = 0;	
	let rtn = '';
	let bnds = {'height': 0, 'width': 250, 'show': false};
	// config Services
	if (typeof data.Services !== 'undefined') {
		bnds.height = bnds.height + 100;
		rectH = rectH + 100;
		bnds.show = true;
		rtn = rtn
		+ '<image x="50"  y="25" width="50"  height="50" href="images/k8/svc.svg" onmousemove="showTooltip(evt, \'' 
		+ buildSvgInfo(data.Services, fnum, 'Service') 
		+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'Service@' + fnum +'\')"/>' 
		+ '<line  x1="100" x2="150" y1="50" y2="50" stroke="red" stroke-width="2" stroke-linecap="round" stroke-dasharray="3, 3"/>'
		+ '<line  x1="150" x2="145" y1="50" y2="45" stroke="red" stroke-width="2" stroke-linecap="round"/>'
		+ '<line  x1="150" x2="145" y1="50" y2="55" stroke="red" stroke-width="2" stroke-linecap="round"/>';

		if (typeof data.Services[0] !== 'undefined') {
			if (typeof data.Services[0].eps !== 'undefined') {
				if (data.Services[0].eps !== '') {
					rtn = rtn
					+ '<image x="150"  y="25" width="50"  height="50" href="images/k8/eps.svg" onmousemove="showTooltip(evt, \'' 
					+ buildSvgInfo(data.Services, fnum, 'EndPointSlice') 
					+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'EndPointSlice@' + fnum +'\')"/>' 
					+ '<line  x1="200" x2="300" y1="50" y2="50" stroke="black" stroke-width="2" stroke-linecap="round"/>'
					+ '<line  x1="300" x2="295" y1="50" y2="45" stroke="black" stroke-width="2" stroke-linecap="round"/>'
					+ '<line  x1="300" x2="295" y1="50" y2="55" stroke="black" stroke-width="2" stroke-linecap="round"/>';
				}
			}
			if (typeof data.Services[0].ep !== 'undefined') {
				if (data.Services[0].ep !== '') {
					rtn = rtn
					+ '<image x="150"  y="25" width="50"  height="50" href="images/k8/ep.svg" onmousemove="showTooltip(evt, \'' 
					+ buildSvgInfo(data.Services, fnum, 'EndPoint') 
					+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'EndPoint@' + fnum +'\')"/>' 
					+ '<line  x1="200" x2="300" y1="50" y2="50" stroke="black" stroke-width="2" stroke-linecap="round"/>'
					+ '<line  x1="300" x2="295" y1="50" y2="45" stroke="black" stroke-width="2" stroke-linecap="round"/>'
					+ '<line  x1="300" x2="295" y1="50" y2="55" stroke="black" stroke-width="2" stroke-linecap="round"/>';
				} 
			}
			if (data.Services[0].eps !== '' && data.Services[0].ep !== '') {
				rtn = rtn 
				+ '<text x="120" y="12" class="pickIcon">(ep and eps both located</text>'
				+ '<text x="124" y="20" class="pickIcon">only showing one item)</text>'
			}


		}
		if (bnds.show = true) {
			rtn = rectP1 + rectH + rectP2 + rtn;
		};
	}
	return {'bnds': bnds, 'rtn': rtn}
}

function svgGenerators(data, fnum) {
	let rectP1a = '<rect  x="' 
	let rectP1b = '"   y="0"  width="' 
	let rectP1c = '" height="' 
	let rectP2a = '" rx="15" stroke-dasharray="1, 2" stroke-width="1"  stroke="black" fill="';
	let rectP2b = '"/>';
	let rectFill = 'pink';
	let rectH = 0;
	let rtn = '';
	let x = 100;
	let width = 150;
	let bnds = {'height': 0, 'width': 150, 'show': false, 'crev': false};
	// config generators
	if (typeof data.creationChain !== 'undefined') {
		let kind;
		let image;

		if (fnum === '1640.0') {
			console.log('k')
		}

		if (typeof data.creationChain.level0 !== 'undefined') {
			if (data.creationChain.level0 === 'NoCreationChain') {
				bnds.show = true;
				bnds.height = bnds.height + 100;
				rectH = rectH + 100;
				rectFill = 'none';
				image = checkImage('Unknown');
				rtn = rtn 
				+ '<image x="150" y="25"  width="50" height="50" fill="red" href="images/' + image + '.svg" '
				+ 'onmousemove="showTooltip(evt, \'' 
				+ buildSvgInfo('', fnum, 'Unknown') 
				+ '\');" onmouseout="hideTooltip()" />' 
			}
		}


		if (typeof data.creationChain.level1Kind !== 'undefined') {
			bnds.show = true;
			bnds.height = bnds.height + 100;
			rectH = rectH + 100;
			kind = data.creationChain.level1Kind;
			image = checkImage(kind);
			rtn = rtn 
			+ '<image x="150" y="25"  width="50" height="50" href="images/' + image + '.svg" '
			+ 'onmousemove="showTooltip(evt, \'' 
			+ buildSvgInfo(data, fnum, kind) 
			+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'level1@' + fnum +'\')"/>' 
			+ '<line  x1="200" x2="300" y1="50" y2="50"  stroke="red" stroke-width="2" stroke-linecap="round" stroke-dasharray="3, 3"/>'
			+ '<line  x1="300" x2="295" y1="50" y2="45" stroke="red" stroke-width="2" stroke-linecap="round"/>'
			+ '<line  x1="300" x2="295" y1="50" y2="55" stroke="red" stroke-width="2" stroke-linecap="round"/>'

			if (typeof data.creationChain.level2Kind !== 'undefined') {
				kind = data.creationChain.level2Kind;
				image = checkImage(kind);
				width = width + 100;
				x = 0;
				bnds.width = width;
				rtn = rtn 
				+ '<image x="50" y="25"  width="50" height="50" href="images/' + image + '.svg" '
				+ 'onmousemove="showTooltip(evt, \'' 
				+ buildSvgInfo(data, fnum, kind) 
				+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'level2@' + fnum +'\')"/>' 
				+ '<line  x1="100" x2="150" y1="50" y2="50" stroke="red" stroke-width="2" stroke-linecap="round" stroke-dasharray="3, 3"/>'
				+ '<line  x1="150" x2="145" y1="50" y2="45" stroke="red" stroke-width="2" stroke-linecap="round"/>'
				+ '<line  x1="150" x2="145" y1="50" y2="55" stroke="red" stroke-width="2" stroke-linecap="round"/>'
			};

			// when adding the HPA increase the bnds.height
		}

		if (typeof data.ControllerRevision !== 'undefined') {
			bnds.crev = true;
			rectH = rectH + 75;
			kind = 'ControllerRevision';
			image = checkImage(kind);
			let crFnum = '';
			if (typeof data.ControllerRevision[0] !== 'undefined') {
				if (typeof data.ControllerRevision[0].fnum !== 'undefined') {
					let crFnum = data.ControllerRevision[0].fnum
					rtn = rtn 
					+ '<image x="150" y="100"  width="50" height="50" href="images/' + image + '.svg" '
					+ 'onmousemove="showTooltip(evt, \'' 
					+ buildSvgInfo(data.ControllerRevision, crFnum, kind) 
					+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'ControllerRevision@' + crFnum +'\')"/>' 
					+ '<line  x1="175" x2="175" y1="75" y2="100"  stroke="red" stroke-width="2" stroke-linecap="round" stroke-dasharray="3, 3"/>'

					+ '<line  x1="175" x2="170" y1="100" y2="95" stroke="red" stroke-width="2" stroke-linecap="round"  stroke-dasharray="3, 3"/>'
					+ '<line  x1="175" x2="180" y1="100" y2="95" stroke="red" stroke-width="2" stroke-linecap="round" stroke-dasharray="3, 3"/>'
				
				}
			} 
		}

		if (typeof data.HPA !== 'undefined') {
			rectH = rectH + 75;
			let hPos = 50;
			if (typeof data.spec !== 'undefined') {
				if (typeof data.spec.scaleTargetRef !== 'undefined') {
					if (data.spec.scaleTargetRef.kind !== 'Deployment') {
						hPos = 150;
					}
				}
			}
			kind = 'HorizontalPodAutoscaler';
			image = checkImage(kind);
			let hpaFnum = '';
			if (typeof data.HPA.fnum !== 'undefined') {
				hpaFnum = data.HPA.fnum
				if (typeof data.HPA.spec !== 'undefined') {
					rtn = rtn 
					+ '<image x="' + hPos + '" y="100"  width="50" height="50" href="images/' + image + '.svg" '
					+ 'onmousemove="showTooltip(evt, \'' 
					+ buildSvgInfo(data.HPA, hpaFnum, kind) 
					+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'HorizontalPodAutoscaler@' + hpaFnum +'\')"/>' 

					if (hPos === 50) {  // Deployment 
						rtn = rtn
						+ '<line  x1="75" x2="75" y1="75" y2="100"  stroke="black" stroke-width="2" stroke-linecap="round" />'
						+ '<line  x1="75" x2="70" y1="75" y2="80" stroke="black" stroke-width="2" stroke-linecap="round"/>'
						+ '<line  x1="75" x2="80" y1="75" y2="80" stroke="black" stroke-width="2" stroke-linecap="round"/>'
					} else {            // Other
						rtn = rtn
						+ '<line  x1="175" x2="175" y1="75" y2="100"  stroke="black" stroke-width="2" stroke-linecap="round" />'
						+ '<line  x1="175" x2="170" y1="75" y2="80" stroke="black" stroke-width="2" stroke-linecap="round"/>'
						+ '<line  x1="175" x2="180" y1="75" y2="80" stroke="black" stroke-width="2" stroke-linecap="round"/>'
					}
				}
			} 
		}

		if (typeof data.CRD !== 'undefined') {
			if (typeof data.CRD[0].level1CRD !== 'undefined') {
				if (data.CRD[0].level1CRD === true) {
					image = checkImage('CRD');
					let cFnum1 = data.CRD[0].level1Fnum;
					let action1 = buildSvgInfo(data.CRD[0].level1Name, cFnum1, 'CRD')
					let what1 = '<image x="108" y="3"  width="40" height="40" href="images/' + image + '.svg" '
					+ 'onmousemove="showTooltip(evt, \'' 
					+ action1
					+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'CRD@' + cFnum1 +'\')"/>' 
					+ '<line  x1="175" x2="175" y1="20" y2="26" stroke="black" stroke-width="2" stroke-linecap="round"/>' 
					+ '<line  x1="175" x2="147" y1="20" y2="20"  stroke="black" stroke-width="2" stroke-linecap="round"/>' 
					+ '<line  x1="147" x2="151" y1="20" y2="15"  stroke="black" stroke-width="2" stroke-linecap="round"/>'
					+ '<line  x1="147" x2="151" y1="20" y2="25"  stroke="black" stroke-width="2" stroke-linecap="round"/>'
					rtn = rtn + what1;
				}
			}
			if (typeof data.CRD[0].level2CRD !== 'undefined') {
				if (data.CRD[0].level2CRD === true) {
					image = checkImage('CRD');
					let cFnum2 = data.CRD[0].level2Fnum;
					let action2 = buildSvgInfo(data.CRD[0].level2Name, cFnum2, 'CRD')
					let what2 = '<image x="8" y="3"  width="40" height="40" href="images/' + image + '.svg" '
					+ 'onmousemove="showTooltip(evt, \'' 
					+ action2
					+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'CRD@' + cFnum2 +'\')"/>' 
					+ '<line  x1="75" x2="75" y1="20" y2="26" stroke="black" stroke-width="2" stroke-linecap="round"/>' 
					+ '<line  x1="75" x2="47" y1="20" y2="20"  stroke="black" stroke-width="2" stroke-linecap="round"/>' 
					+ '<line  x1="47" x2="51" y1="20" y2="15"  stroke="black" stroke-width="2" stroke-linecap="round"/>'
					+ '<line  x1="47" x2="51" y1="20" y2="25"  stroke="black" stroke-width="2" stroke-linecap="round"/>'
					rtn = rtn + what2;
				}
			}
		}

		if (bnds.show === true) {
			rtn = rectP1a + x + rectP1b + width+ rectP1c + rectH + rectP2a + rectFill + rectP2b + rtn;
		}
	}

	return {'bnds': bnds, 'rtn': rtn}
}

function svgConfig(data, fnum) {
	let rectP1 = '<rect  x="0"   y="0"  width="250" height="' 
	let rectP2 = '" rx="15" stroke-dasharray="1, 2" stroke-width="1"  stroke="black" fill="lightyellow"/>';
	let rectH = 0;
	let rtn = '';
	let bnds = {'height': 0, 'width': 250, 'show': false};
	// config secrets
	if (typeof data.Secret !== 'undefined') {
		rectH = 100;
		bnds.height = 100;
		bnds.show = true;	
		rtn = rtn
		+ '<image x="50"  y="25" width="50"  height="50" href="images/k8/secret.svg" onmousemove="showTooltip(evt, \'' 
		+ buildSvgInfo(data.Secret, fnum, 'Secret') 
		+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'Secret@' + fnum +'\')"/>' 
		+ '<line  x1="75" x2="75" y1="75" y2="150" stroke="black" stroke-width="2" stroke-linecap="round"/>' 
		+ '<line  x1="75" x2="70" y1="75" y2="80"  stroke="black" stroke-width="2" stroke-linecap="round"/>' 
		+ '<line  x1="75" x2="80" y1="75" y2="80"  stroke="black" stroke-width="2" stroke-linecap="round"/>';
		if (data.Secret.length > 0) {
			rtn = rtn + '<text x="95" y="80" class="small">(' + data.Secret.length + ')</text>'
		}
	}

	// config configMaps
	if (typeof data.ConfigMap !== 'undefined') {
		rectH = 100;
		bnds.height = 100;
		bnds.show = true;	
		rtn = rtn
		+ '<image x="150"  y="25" width="50"  height="50" href="images/k8/cm.svg" onmousemove="showTooltip(evt, \''
		+ buildSvgInfo(data.ConfigMap, fnum, 'ConfigMap')
		+ '\');" onmouseout="hideTooltip()"  onclick="getDef2(\'ConfigMap@' + fnum +'\')"/>'
		+ '<line  x1="175" x2="175" y1="75" y2="150" stroke="black" stroke-width="2" stroke-linecap="round"/>'
		+ '<line  x1="175" x2="170" y1="75" y2="80"  stroke="black" stroke-width="2" stroke-linecap="round"/>'
		+ '<line  x1="175" x2="180" y1="75" y2="80"  stroke="black" stroke-width="2" stroke-linecap="round"/>'
		if (data.ConfigMap.length > 0) {
			rtn = rtn + '<text x="195" y="80" class="small">(' + data.ConfigMap.length + ')</text>'
		}
	}
	if (bnds.show === true) {
		rtn = rectP1 + rectH + rectP2 + rtn;
	}
	return {'bnds': bnds, 'rtn': rtn}
}


function svgPod(data, fnum, podH) {
	let bkgFill = "#e3e3e3";
	let rectP1 = '<rect  x="0"   y="0"  width="250" height="' 
	let rectP2 = '" rx="15" stroke-dasharray="1, 2" stroke-width="1"  stroke="black" fill="' + bkgFill + '"/>';
	let rectH = 0;
	let rtn = '';
	let eS = '';
	let y = 0;
	let yT = 0;
	let yS = 0;
	let bnds = {'height': 0, 'width': 250, 'show': false};
	let outterName = 'No located workload information';
	if (data.typeCcnt > 0 || data.typeIcnt > 0) {
		outterName = data.name;
		bnds.height = bnds.height + 100;
		bnds.show = true;
		rectH = 100;
		rtn = rtn 
		+ '<image x="100"  y="25" width="50"  height="50" href="images/k8/pod.svg" onmousemove="showTooltip(evt, \'' 
		+ buildSvgInfo(data, fnum, 'Pod') 
		+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'workload@' + fnum + '\')"/>';
		let cy;

		if (data.typeCcnt > 0) { 
			rectH = rectH + 50;
			y = y + 80;
			yT = y + 13;
			if (data.typeCcnt > 1) { 
				eS = 's';
			} else {
				eS = '';
			}
			rtn = rtn
			+ '<rect x="50" y="' + y + '"  width="150" height="20" rx="5" stroke-width="0.5" stroke="black" fill="white" '
			+ ' onmousemove="showTooltip(evt, \'' 
			+ buildSvgInfo(data, fnum, 'Container') 
			+ '\');" onmouseout="hideTooltip()" />'
			+ '<text x="60" y="' + yT + '" class="small">' + data.typeCcnt + ' Container' + eS + '</text>'
		}

		if (data.typeIcnt > 0) { 
			rectH = rectH + 50;
			y = y + 50;
			yT = y + 15;
			if (data.typeCcnt > 1) { 
				eS = 's';
			} else {
				eS = '';
			}
			rtn = rtn
			+ '<rect x="50" y="' + y + '"  width="150" height="20" rx="5" stroke-width="0.5" stroke="black" fill="white" ' 
			+ ' onmousemove="showTooltip(evt, \'' 
			+ buildSvgInfo(data, fnum, 'Container') 
			+ '\');" onmouseout="hideTooltip()" />'
			+ '<text x="60" y="' + yT + '" class="small">' + data.typeCcnt + ' Init Container' + eS + '</text>'
		}
	}

	// Phase 
	let statusFill = 'white'
	if (typeof data.phase !== 'undefined') {
		if (data.phase === 'Pending') {
			statusFill = "#fa7373";
		}if (data.phase === 'Failed') {
			statusFill = "#fa7373";
		}
	}
	let phaseReason = '';
	if (typeof data.status !== 'undefined') {
		if (typeof data.status.reason !== 'undefined') {
			phaseReason = ' : ' + data.status.reason;
		}
	}

	yS = yT + 15;
	rtn = rtn
	+ '<rect x="50" y="' + yS + '"  width="150" height="20" rx="5" stroke-width="0.5" stroke="black" fill="' + statusFill + '" '
	+ ' onmousemove="showTooltip(evt, \'' 
	+ buildSvgInfo(data, fnum, 'Phase') 
	+ '\');" onmouseout="hideTooltip()" />'
	yS = yS + 13;
	rtn = rtn
	+ '<text x="60" y="' + (yS + 0)  + '" class="small">'
	+ data.phase + '</text>'
	+ '<text x="90" y="' + (yS + 0)  + '" class="small">'
	+ phaseReason
	+ '</text>'

	// Conditions
	let contFill = 'white'
	let contText = '';
	let skip = false;
	if (typeof data.status !== 'undefined') {
		if (typeof data.status.conditions === 'undefined') {
			contFill = "#fa7373";
			contText = ' - None located'
			skip = true;
		}
	}	

	if (skip === false) {
		rectH = rectH + 25;
		yS = yS + 15;
		rtn = rtn
		+ '<rect x="50" y="' + yS + '"  width="150" height="20" rx="5" stroke-width="0.5" stroke="black" fill="' + contFill + '" '
		+ ' onmousemove="showTooltip(evt, \'' 
		+ buildSvgInfo(data.status, fnum, 'Conditions') 
		+ '\');" onmouseout="hideTooltip()" />'
		yS = yS + 13;
		rtn = rtn
		+ '<text x="60" y="' + yS + '" class="small" >'
		+ 'Pod Conditions' + contText
		+ '</text>'
	}

	rectH = rectH + 25;
	yS = yS + 15;
	statusFill = 'white';
	let statusMsg = 'Container Statuses';
	if (typeof data.status !== 'undefined') {
		if (typeof data.status.containerStatuses !== 'undefined') {
			if (typeof data.status.containerStatuses[0] !== 'undefined') {
				if (typeof data.status.containerStatuses[0].state !== 'undefined') {
					bnds.height = bnds.height + 25;
					if (typeof data.status.containerStatuses[0].state.waiting !== 'undefined') {
						if (typeof data.status.containerStatuses[0].state.waiting.reason !== 'undefined') {
							let reason = data.status.containerStatuses[0].state.waiting.reason;
							if (reason === 'CrashLoopBackOff') {
								statusFill = '#fa7373'
								statusMsg = statusMsg + ': CrashLoopBackOff'
							} else if (reason === 'ImagePullBackOff') {
								statusFill = '#fa7373';
								statusMsg = statusMsg + ': ImagePullBackOff'
							} else if (reason === 'ContainerCreating') {
								statusFill = '#fa7373';
								statusMsg = statusMsg + ': ContainerCreating'
							} else {
								statusFill = 'grey'
								console.log(data.status.containerStatuses[0].state.waiting.reason)
							}
						}
					} else if (typeof data.status.containerStatuses[0].state.running !== 'undefined') {
						statusFill = '#66ed8a';
						statusMsg = statusMsg + ': Running'
					}
				}
			}
		} else {
			statusFill = '#fa7373'
			statusMsg = statusMsg + ': None'
		}
	}

	rtn = rtn
	+ '<rect x="50" y="' + yS + '"  width="150" height="20" rx="5" stroke-width="0.5" stroke="black" fill="' + statusFill + '" '
	+ ' onmousemove="showTooltip(evt, \'' 
	+ buildSvgInfo(data.status, fnum, 'Statuses') 
	+ '\');" onmouseout="hideTooltip()" />'
	yS = yS + 13;
	rtn = rtn
	+ '<text x="60" y="' + yS + '" class="small" >'
	+ statusMsg 
	+ '</text>'	
	bnds.height = bnds.height + 25;
	
	if (bnds.show === true) {
		if (podH > rectH) {
			rectH = podH;
		}
		rtn = rectP1 + rectH + rectP2 + rtn;
	}
	return {'bnds': bnds, 'rtn': rtn, 'outterName': outterName}
}

function buildSvgInfo(data, fnum, type) {
	let id = fnum+'.'+type;
	let tName = type;
	if (typeof svgInfo[id] === 'undefined') {
		svgInfo[id] = [];
	}
	let content = buildTipContent(data, type, fnum)
	if (type === 'Phase') {
		tName = 'Status'
	}
	if (type === 'CRD') {
		tName = 'CustomResourceDefinition'
	}
	// check if an entry already exists, if so skip
	if (typeof svgInfo[id][0] === 'undefined') {
		svgInfo[id].push('<span style="font-size: 0.80rem; text-decoration: underline;">' + tName + '</span><br><span style="font-size: 0.70rem;">' + content + '</span>');
	}
	return id;
}

function buildTipContent(data, type, fnum) {
	let cnt = 0;
	let content = '';
	if (typeof data === 'undefined') {
		content =  'No info available';
		content = '<div class="vpkfont-xsm">' + content + '</div>'
		return content;
	}

	if (type === 'Secret' || type === 'ConfigMap') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				cnt++;
				content = content + '(' + cnt + ') ' + data[k].name + ' ('+ data[k].use +')<br>';
			}
		}	
	} else if (type === 'Unknown') {
		content = 'No resource type located or failed to properly be created.';  
	} else if (type === 'HorizontalPodAutoscaler') {
		content = formatJSON(data);  
	} else if (type === 'EndPoint') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + data[k].name ;  
			}
		}	
	} else if (type === 'CRD') {
		content = 'Name: ' + data;  
	} else if (type === 'ControllerRevision') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			content = content + data[0].name;  
		}	
	} else if (type === 'Conditions') {
		if (typeof data.conditions !== 'undefined') {
			if (typeof data.conditions[0] !== 'undefined' ) {
				cnt = 0;			
				for (let k = 0; k < data.conditions.length; k++) {
					cnt++;
					content = content + '- &nbsp;&nbsp;<b>Type:</b> ' + data.conditions[k].type + '<br>'
					       + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Status:</b> ' + data.conditions[k].status + '<br>';
					if (typeof data.conditions[k].message !== 'undefined') {
						content = content + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Message:</b> ' + data.conditions[k].message + '<br>'
					}
					if (typeof data.conditions[k].reason !== 'undefined') {
						content = content + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Reason:</b> ' + data.conditions[k].reason + '<br>'
					}					
					content = content + '<br>'
				}
			}	
		}
	} else if (type === 'Statuses') {
		if (typeof data.containerStatuses !== 'undefined' ) {
			cnt = 0;			
			content = formatJSON(data.containerStatuses);  
		} else {
			content = 'No statuses located'
		}	
	} else if (type === 'EndPointSlice') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + data[k].name ;  
			}
		}	
	} else if (type === 'Phase') {
		content = 'None located';
		//content = formatJSON(data.status);
		if (typeof data.status !== 'undefined') {
			content = '';
			if (typeof data.status.hostIP !== 'undefined') {
				content = content + 'HostIP: ' + data.status.hostIP + '<br>';
			}
			if (typeof data.status.podIP !== 'undefined') {
				content = content + 'PodIP: ' + data.status.podIP + '<br>';
			}
			if (typeof data.status.podIPs !== 'undefined') {
				if (typeof data.status.podIPs.length > 1 !== 'undefined') {
					content = content + 'PodIPs: <br>' + formatJSON(data.status.podIPs) + '<br>';
				}
			}			
		}
	} else if (type === 'PersistentVolumeClaim') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].pvcName;
				if (typeof data[k].pcvStorageClass !== 'undefined') {
					if (data[k].pcvStorageClass !== '') {
						content = content + 'Storage class: ' + data[k].pcvStorageClass + '<br>';  
					}
				}
				if (typeof data[k].pcvVolumeName !== 'undefined') {
					if (data[k].pcvVolumeName !== '') {
						content = content + 'Volume name: ' + data[k].pcvVolumeName + '<br>';  
					}
				}
				if (typeof data[k].pcvSelectorLabel !== 'undefined') {
					if (data[k].pcvSelectorLabel !== '') {
						content = content + 'Selector label: ' + data[k].pcvSelectorLabel + '<br>';  
					}
				}
			}
		}	
	} else if (type === 'PersistentVolume') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].pvName + '<br>';
				if (data[k].pvLocalPath !== '') {
					content = content + 'Local path: ' + data[k].pvLocalPath + '<br>';
				}  
				if (data[k].pvHostPath !== '') {
					content = content + 'Host path: ' + data[k].pvHostPath + '<br>';
				}  
				if (data[k].pvNFSPath !== '') {
					content = content + 'NFS path: ' + data[k].pvNFSPath + '<br>';
				}			}
		}	
	} else if (type === 'StorageClass') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].storageClassName ;  
			}
		}	
	} else if (type === 'Pod') {
		content = '';
		if (typeof data.name !== 'undefined' ) {
			content = content + 'Name: ' + data.name + '<br>';
			if (typeof data.Volume !== 'undefined' ) {
				content = content + 'Volume(s):' + '<br>'
				cnt = 0;			
				for (let k = 0; k < data.Volume.length; k++) {
					cnt++;
					content = content + '(' + cnt + ') ' + data.Volume[k].name + '<br>';  
				}			
			}
		}	
	} else if (type === 'Container') {
		content = '' 
		if (typeof data.containerNames !== 'undefined' ) {
			for (let k = 0; k < data.containerNames.length; k++) {
				content = content 
				+ '- &nbsp;&nbsp;<b>Name:</b> ' + data.containerNames[k].c_name + '<br>'
				+ '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Image:</b> ' + data.containerNames[k].c_image + '<br>';
			}
		}	
	}  else if (type === 'Service') {
		content = fnum + '<br>' 
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				cnt++;
				content = data[k].name+ '<br>';
			}
		}	
	} else 	if (type === 'ServiceAccount') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				cnt++;
				content = content + '(' + cnt + ') ' + data[k].name + '<br>';
			}
		}	
	} else if (type === 'DaemonSet' || type === 'ReplicaSet' || type === 'Deployment' || type === 'DeploymentConfig' || type === 'StatefulSet' || type === 'ReplicationController') {
		content = '';
		if (typeof data.creationChain !== 'undefined' ) {
			if (typeof data.creationChain.level0 !== 'undefined' ) {
				content = content + 'Level 0: Pod - ' + ' - ' + data.name + '<br>'
			}
			if (typeof data.creationChain.level1Fnum !== 'undefined' ) {
				content = content + 'Level 1: ' + data.creationChain.level1Kind + ' - ' + data.creationChain.level1Name + '<br>';
			}
			if (typeof data.creationChain.level2Fnum !== 'undefined' ) {
				content = content + 'Level 2: ' + data.creationChain.level2Kind + ' - ' + data.creationChain.level2Name + '<br>';
			}
		}

	}
	content = '<div class="vpkfont-xsm">' + content + '</div>'
	return content;	
}

function formatJSON(content) {
	let cData = JSON.stringify(content, null, 2);
	cData = cData.split('\n');
	let nLine = '';
	let rtn = '';
	let pttrn = /^\s*/;
	let spc = 0;
	for (let i = 0; i < cData.length; i++) {
		nLine = '';
		spc = cData[i].match(pttrn)[0].length;
		if (spc > 0) {
			for (let s = 0; s < spc; s++) {
				nLine = nLine + '&nbsp;'
			}
		}
		rtn = rtn + nLine + cData[i].substring(spc) + '<br>';
	}
	return rtn;
} 

function checkImage(kind) {
	let image;
	if (kind === 'Alertmanager') {
		image = 'openshift/ocp-am';
	} else if (kind === 'CRD') {
		image = 'k8/crd';
	} else if (kind === 'ControllerRevision') {
		image = 'k8/c-rev';
	} else if (kind === 'DaemonSet') {
		image = 'k8/ds';
	} else if (kind === 'CronJob') {
		image = 'k8/cronjob';
	} else if (kind === 'Job') {
		image = 'k8/job';
	} else if (kind === 'Deployment') {
		image = 'k8/deploy';
	} else if (kind === 'DeploymentConfig') {
		image = 'openshift/ocp-dc';
	} else if (kind === 'HorizontalPodAutoscaler') {
		image = 'k8/hpa';
	} else if (kind === 'Prometheus') {
		image = 'openshift/ocp-prometheus';
	} else if (kind === 'ReplicaSet') {
		image = 'k8/rs';
	} else if (kind === 'HorizontalPodAutoscaler') {
		image = 'k8/hpa';
	} else if (kind === 'ReplicationController') {
		image = 'k8/rc';
	}  else if (kind === 'Node') {
		image = 'k8/node';
	} else if (kind === 'StatefulSet') {
		image = 'k8/sts';
	} else if (kind === 'Unknown') {
		image = 'unk';
	} else {
		image = 'unk';
	}
	return image;
}



//----------------------------------------------------------
console.log('loaded vpkschematic.js');