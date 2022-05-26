#!/usr/bin/env python3

import os,sys,re,codecs

from collections import OrderedDict

from Baubles.Colours import Colours
from GoldenChild.xpath import *
from Perdy.parser import printXML

colours = Colours()

base='/step:STEP-ProductInformation'

# { element: list(test) }

keeps = OrderedDict([
	( 'step:EdgeTypes', [
	]),
	( 'step:UnitList', [
	]),
	( 'step:SetupEntities', [
	]),
	( 'step:Keys/step:Key', [
	]),
	( 'step:Assets', [
	]),
    ( 'step:STEPWorkflows', [
    ]),
    ( 'step:UserTypes/step:UserType', [
		'starts-with(@ID,"XMI_")',
    ]),
    ( 'step:UserTypes//step:Value', [
		'starts-with(@AttributeID,"XMI_")',
    ]),
    ( 'step:CrossReferenceTypes/*', [
		'starts-with(@ID,"XMI_")',
    ]),
    ( 'step:CrossReferenceTypes//step:Value', [
		'starts-with(@AttributeID,"XMI_")',
    ]),
    ( 'step:ListOfValuesGroupList/step:ListOfValuesGroup/step:ListOfValuesGroup', [
        'starts-with(@ID, "XMI_")',
    ]),
    ( 'step:ListsOfValues/step:ListOfValue', [
		'starts-with(@ID, "XMI_")',
    ]),
    ( 'step:AttributeGroupList/step:AttributeGroup', [
		'starts-with(@ID, "XMI_")',
    ]),
    ( 'step:AttributeList/step:Attribute', [
		'starts-with(@ID,"XMI_")',
    ]),
    ( 'step:AttributeList//step:Value', [
		'starts-with(@AttributeID,"XMI_")',
    ]),
    ( 'step:PortalConfigurations', [
    ]),
    ( 'step:ComponentModels', [
    ]),
    ( 'step:Classifications/step:Classification/step:Classification', [
		'starts-with(@ID,"XMI_")',
    ]),
    ( 'step:Products/step:Product', [
		'starts-with(@ID,"XMI_")',
    ]),
    ( 'step:BusinessLibraries/step:BusinessRule', [
		'starts-with(@ID,"XMI_")',
    ]),
    ( 'step:BusinessRules/step:BusinessRule', [
		'starts-with(@ID,"XMI_")',
    ]),
	( 'step:STEPWorkflows/step:STEPWorkflow', [
	]),
    ( 'step:Entities/step:Entity', [
    ]),
	( 'step:ImportConfigurations', [
	]),
	( 'step:ExportConfigurations', [
	]),
	('step:IntegrationEndpoints/step:OutBoundIntegrationEndpoint', [
	]),
	('step:IntegrationEndpoints/step:InBoundIntegrationEndpoint', [
	]),
	('step:IntegrationEndpoints/step:GatewayIntegrationEndpoint', [
	]),
	( 'step:SetupGroups/step:SetupGroup', [
	]),
])

for file in sys.argv[1:]:

	if not os.path.isfile(file):
		continue
	
	print(file)
	
	STEP = XML(*getContextFromFile(file))
	STEP.ctx.xpathRegisterNs('step', 'http://www.stibosystems.com/step')

	for path, tests in keeps.items():
		print(path)
		keepers = set()

		elements =  getElements(STEP.ctx, '%s/%s'%(base, path))

		for test in tests:
			for keep in getElements(STEP.ctx, '%s/%s[%s]'%(base, path, test)):
				keepers.add(keep)

		for element in elements:
			if element in keepers:
				print('\t+%s%s%s'%(colours.Green, getAttribute(element,'ID'), colours.Off))
			else:
				print('\t-%s%s%s'%(colours.Red, getAttribute(element,'ID'), colours.Off))
				element.unlinkNode()
				element.freeNode()

	root = STEP.doc.getRootElement()
	setAttribute(root, 'ContextID', 'Australian')
	setAttribute(root, 'AutoApprove', 'Y')

	with codecs.open(file, 'w', encoding='utf8') as output:
		printXML(str(STEP.doc), output=output)
		
