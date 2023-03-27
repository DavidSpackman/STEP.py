!INC Local Scripts.EAConstants-JScript
!INC EAScriptLib.JScript-XML
!INC User Scripts.Library

// https://learn.microsoft.com/en-us/office/vba/language/reference/user-interface-help/readall-method
// https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ms756987(v=vs.85)#jscript-examples
// https://learn.microsoft.com/en-us/previous-versions/windows/desktop/dd874871(v=vs.85)

var namespace = 'http://www.stibosystems.com/step';
var NODE_ELEMENT = 1;
var FSREAD = 1;

function showCache(cache, package) {
	var skeys = cache.Keys().toArray();
	for (var s=0; s<skeys.length; s++) {
		var stereotype = skeys[s];
		Session.Output('/'+stereotype);
		var ikeys = cache.Item(stereotype).Keys().toArray();
		for (var i=0; i<ikeys.length; i++) {
			var id = ikeys[i];
			var element as EA.Element;
			element = cache.Item(stereotype).Item(id);
			Session.Output('  @ID="'+id+'" name="'+element.Name+'"');
		}
	}

}

function fillCache(cache, package, indent) {
	if (! indent) indent = '';
	var package as EA.Package;
	//Session.Output(indent+'/'+package.Name);
	
	for (var e=0; e<package.Elements.Count; e++) {
		var element as EA.Element;
		element = package.Elements.GetAt(e);
		var stereotype as EA.Stereotype;
		stereotype = element.StereotypeEx;
		if (stereotype) {
			//Session.Output(indent+'  >'+element.Name);
			putCache(cache, stereotype, element);
		}
	}
	for (var p=0; p<package.Packages.Count; p++) {
		var child as EA.Package;
		child = package.Packages.GetAt(p);
		fillCache(cache, child, indent+'  ');
	}
}

function putCache(cache, stereotype, element) {
	var tag as EA.TaggedValue;
	tag = getTaggedValue(element, '@ID');
	if (tag && tag.Value) {
		if (! cache.Exists(''+stereotype)) {
			cache.Add(stereotype, new ActiveXObject("Scripting.Dictionary"));
		}
		cache.Item(''+stereotype).Add(tag.Value, element);
	}
}

function getCache(cache, stereotype, id) {
	var result as EA.Element;
	if (! id) return;
	if (cache.Exists(''+stereotype)) {
		if (cache.Item(''+stereotype).Exists(id)) {
			result = cache.Item(''+stereotype).Item(id);
		}
	}
	return result;
}

function AddElementNS(parent, name, ns) {
	var result;
	var _doc;
	if (parent.nodeType == 9) {
		_doc = parent;
	}
	else {
		_doc = parent.ownerDocument;
	}
	if (ns && ns != "") {
		result = _doc.createNode(NODE_ELEMENT, name, ns)
	}
	else {
		result = _doc.createElement(name);
	}
	parent.appendChild(result);
	return result;
}

function findPackage(parent, stereotype, name, id) {
	var parent as EA.Package;
	var result;

	for (var c=0; c<parent.Packages.Count; c++) {
		var child as EA.Package;
		child = parent.Packages.GetAt(c);
		if (child.StereotypeEx == stereotype && child.Name == name) {
			tag = getTaggedValue(child, '@ID');
			if (id && tag && tag.Value) {
				if (tag.Value == id) {
					result = child;
					break;
				}
			}
			else {
				result = child;
				break;
			}
		}
	}
	
	if (!result) {
		for (var c=0; c<parent.Packages.Count; c++) {
			var child as EA.Package;
			result = findPackage(child, stereotype, name, id);
			if (result) break;
		}
	}
	
	return result;
}

function findOrCreatePackage(parent, stereotype, name, id) {
	var result as EA.Package;
	result = findPackage(parent, stereotype, name, id);
	
	if (! result) {
		result = parent.Packages.AddNew(name, 'Class');
		result.Update();
		result.StereotypeEx = 'STEP Types::'+stereotype;
		result.Update();
		Session.Output('+ package="'+result.Name+'" stereotype="'+result.StereotypeEx+'"');
	}

	return result;
}

function findOrCreateElement(parent, tipe, stereotype, name, id, cache) {
	var parent as EA.Element;
	var result as EA.Element;

	result = getCache(cache, stereotype, id);
	
	if (! result) {
		result = parent.Elements.AddNew(name, tipe);
		result.Update();
		result.StereotypeEx = 'STEP Types::'+stereotype;
		setTaggedValue('@ID', id);
		result.Update();
		putCache(cache, stereotype, result);
		Session.Output('+ element="'+result.Name+'" stereotype="'+result.StereotypeEx+'" id="'+id+'"');
	}	
	return result;
	
}

function setTaggedValue(element, name, value) {
	var result as EA.TaggedValue;
	var element as EA.Element;
	if (! element.TaggedValues) return;
		
	for (var t=0; t<element.TaggedValues.Count; t++) {
		var tag as EA.TaggedValue;
		tag = element.TaggedValues.GetAt(t);
		if (tag.Name == name) {
			result = tag;
			break;
		}
	}
	if (! result) {
		result = element.TaggedValues.AddNew(name, value);
		Session.Output('+ tag name="'+result.Name+'" value="'+result.Value+'"');
	}
	else {
		result.Value = value;
	}
	result.Update();
	
	return result;
}

function getTaggedValue(element, name) {
	var result as EA.TaggedValue;
	var element as EA.Element;
	if (! element.TaggedVAlues) return;

	for (var t=0; t<element.TaggedValues.Count; t++) {
		var tag as EA.TaggedValue;
		tag = element.TaggedValues.GetAt(t);
		if (tag.Name == name) {
			result = tag;
			break;
		}
	}
	return result;
}

function createOrReplaceConnector(source, target, stereotype, name) {
	var source as EA.Element;
	var target as EA.Element;
	var result as EA.Connector;
	var connector as EA.Connector;
	var stereotype as EA.Stereotype;
	var taggedvalue as EA.TaggedValue;
	var prefix = '+';
		
	if (! target) return;
	if (! source) return;
		
	for (var c=0; c<target.Connectors.Count; c++) {
		connector = target.Connectors.GetAt(c);
		if (connector.SupplierID == source.ElementID && stereotype == ''+connector.Stereotype ) {
			result = connector;
			prefix = '~';
			break;
		}
	}
	
	if (! result) {
		result = target.Connectors.AddNew(name, 'Association');
		result.Direction = true;
		result.SupplierID = source.ElementID;
		result.StereotypeEx = 'STEP Types::'+stereotype;
		result.Update();
		target.Update();
	}
	
	Session.Output(prefix+' connector "'+source.Name+' -> '+target.Name+' : <'+result.StereotypeEx+'>');
	
	return result;
}

function setupDiagram(package, name, diagram_type) {
	var package as EA.Package;
	var diagram as EA.Diagram;
	if (! package) return;
		
	if (package.Diagrams) {
		for (var d=0; d<package.Diagrams.Count; d++) {
			diagram = package.Diagrams.GetAt(d);
			break;
		}
	}
	if (! diagram) {
		diagram = package.Diagrams.AddNew(name, diagram_type);
		diagram.Update();
	}

	return diagram;
}

function readUnitsOfMeasures(package, doc, cache) {
	var package as EA.Package;
	var uom_types as EA.Package;
	var uom_items as EA.Package;
	var uom_type as EA.Element;
	var uom_base as EA.Element;
	var uom_item as EA.Element;

	uom_types = findOrCreatePackage(package, 'UOM Types', 'Units of Measure');
	var uom_types_diagram = setupDiagram(uom_types, 'Units of Measure', 'Class');
	
	var UnitFamilies = doc.selectNodes('/s:STEP-ProductInformation/s:UnitList//s:UnitFamily');
	for (var uf=0; uf<UnitFamilies.length; uf++) {
		var UnitFamily = UnitFamilies[uf];
		var UnitFamily_id = XMLGetNamedAttribute(UnitFamily, 'ID');
		var UnitFamily_name = XMLGetNodeText(UnitFamily, 's:Name');
		Session.Output('UnitFamily name="'+UnitFamily_name+'" id="'+UnitFamily_id+'"');

		var items = new ActiveXObject("Scripting.Dictionary"); // { @ID : Element} 
		var bases = new ActiveXObject("Scripting.Dictionary"); //{ BaseUnitID: [source.@ID] }
		
		uom_items = findOrCreatePackage(uom_types, 'Instances', 'UOM '+UnitFamily_name, UnitFamily_id);
		add_diagram_package(uom_types_diagram, uom_items);
		var uom_items_diagram = setupDiagram(uom_items, 'UOM '+ UnitFamily_name, 'Object');

		uom_type = findOrCreateElement(uom_items, 'Class', 'UOM', UnitFamily_name, UnitFamily_id, cache);
		setTaggedValue(uom_type, '@ID', UnitFamily_id);
		setTaggedValue(uom_type, 'Name', UnitFamily_name);
				
		add_diagram_element(uom_items_diagram, uom_type);
		
		var Units = UnitFamily.selectNodes('s:Unit');
		for(var u=0; u<Units.length; u++) {
			var Unit = Units[u];
			var Unit_id = XMLGetNamedAttribute(Unit, 'ID');
			var Unit_name = XMLGetNodeText(Unit, 's:Name');
			
			if (! Unit_name || Unit_name.length == 0) {
				var description = XMLGetNodeText(Unit, 's:MetaData/s:Value[@AttributeID="UnitDescription"]');
				if (description && description.length > 0) {
					name = description;
					uom_item.Name = name;
					uom_item.Update();
				}
			}
			Session.Output('  Unit name="'+Unit_name+'" id="'+Unit_id+'"');
			
			uom_item = findOrCreateElement(uom_items, 'Object', 'UOM instance', Unit_name, Unit_id, cache);
			setTaggedValue(uom_item, '@ID', Unit_id);
			setTaggedValue(uom_item, 'Name', Unit_name);
			
			var Base = Unit.selectSingleNode('s:UnitConversion');
			if (Base) {
				var Factor = XMLGetNamedAttribute(Base, 'Factor');
				setTaggedValue(uom_item, 'Factor', Factor);
				var Offset = XMLGetNamedAttribute(Base, 'Offset');
				setTaggedValue(uom_item, 'Offset', Offset);
				
				var base_id = XMLGetNamedAttribute(Base, 'BaseUnitID');
				if (base_id) {
					if (! bases.Exists(base_id)) {
						bases.Add(base_id, []);
					}
					bases.Item(base_id).push(Unit_id);
					//Session.Output('+ base id="'+base_id+'" source id='+Unit_id+'"');
				}
			}

			uom_item.Update();
			items.Add(Unit_id, uom_item);
			
			add_diagram_element(uom_items_diagram, uom_item);
		}

		var item_ids = items.Keys().toArray();
		for (var i=0; i<item_ids.length; i++) {
			var item_id = item_ids[i];
			//Session.Output('  family source id='+item_id);
			var item = items.Item(item_id);
			//Session.Output('  family: '+item.Name+' -> '+uom_type.Name);
			createOrReplaceConnector(item, uom_type, 'UOM Family');
			item.Update();
		}
		
		var base_ids = bases.Keys().toArray();
		for (var k=0; k<base_ids.length; k++) {
			var base_id = base_ids[k];
			//Session.Output('base ID='+base_id);
			var uom_base = items.Item(base_id);
			//Session.Output('base name='+uom_base.Name);
			if (! uom_base) continue;
			
			var citems = bases.Item(base_id);
			for (var i=0; i<citems.length; i++) {
				var item_id = citems[i];
				//Session.Output('  source ID='+item_id);
				var item as EA.Element;
				item = items.Item(item_id);
				if (!item) continue;
				//Session.Output('  source Name='+item.Name);
				createOrReplaceConnector(item, uom_base, 'UOM Base');
			}
		}
	}
}

function readListOfValuesGroup(package, doc, cache) {
	//todo
	
}

function importStepXML(fileName, diagram, cache) {
	var doc; // as MSXML2.DOMDocument;
	var node; // as MSXML2.DOMNode;

	var package as EA.Package;
	package = Repository.GetPackageByID(diagram.PackageID);
	fillCache(cache, package);
	//showCache(cache, package);
	
	doc = XMLReadXMLFromFile(fileName);
	if (!doc) {
		Session.Output('failed to load '+fileName);
		return;
	}
	doc.setProperty('SelectionNamespaces','xmlns:s="'+namespace+'"');
	
	node = doc.selectSingleNode('/s:STEP-ProductInformation');
	if (node) {
		//Session.Output('nodeName="'+node.nodeName+'"');
		
		var name = 'ExportTime';
		var value = XMLGetNamedAttribute(node, 'ExportTime');
		if (value) {
			Session.Output('name="'+name+'" value="'+value+'"');
		}
	}
	
	readUnitsOfMeasures(package, doc, cache);
	//readListOfValuesGroup(package, doc, cache);
	
}

function writeUnitsOfMeasures(package, doc) {}
function writeListOfValuesGroups(package, doc) {}

function exportStepXML(fileName, diagram, cache) {
	var doc; // as MSXML2.DOMDocument;
	var node; // as MSXML2.DOMNode;

	var package as EA.Package;
	package = Repository.GetPackageByID(diagram.PackageID);
	Session.output('package.GUID="'+package.PackageGUID+'" modified="'+package.Modified+'"');
	
	doc = XMLCreateXMLObject();
	node = AddElementNS(doc, 'STEP-ProductInformation', namespace);
	node.setAttribute('ExportTime', package.Modified);
	
	Session.Output('fileName="'+fileName+'"');
	XMLSaveXMLToFile(doc, fileName);	
	
}

var inputFileName = 'C:/Users/eddo8/git/github.com/eddo888/STEP.py/test/UOM.step.xml';
var outputFileName = 'C:/Users/eddo8/git/github.com/eddo888/STEP.py/test/Sparx.step.xml';

Repository.EnsureOutputVisible( "Debug" );
Repository.ClearOutput("Script");
Session.Output( "Starting" );

// { type: { @ID: Element }}
var cache = new ActiveXObject("Scripting.Dictionary");

var diagram as EA.Diagram;
diagram = Repository.GetDiagramByGuid('{FD97A92D-9741-413e-9585-4310E440FB71}');
//diagram = Repository.GetCurrentDiagram();

//exportStepXML(outputFileName, diagram, cache);
importStepXML(inputFileName, diagram, cache);

Session.Output("Ended");