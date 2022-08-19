#!/usr/bin/env python3

# PYTHON_ARGCOMPLETE_OK

import os, re, sys, gc, time, json, xmltodict, unittest, logging
from collections import OrderedDict
from datetime import datetime
from Perdy.pretty import prettyPrintLn
from Baubles.Colours import Colours

if os.path.dirname(sys.argv[0]) == '.':
	sys.path.insert(0, '..')

from STEP.REST import *

colours = Colours()

config = {
	'-H':'https://stibo-australia-demo.scloud.stibo.com',
	'-U':'DAVE',
	'-C':'GL',
}

workflow_id = 'WX_Product_WF'
state_id = 'WX_Manual_Approve'
product_id = 'WX_0'
reference_id = 'WX_Product_Tag_Classification'


#________________________________________________________________
def render(result):
	if not result: 
		return
	if type(result) in [OrderedDict, list, dict]:
		prettyPrintLn(result)
	else:
		print(result)

#________________________________________________________________
class Test_01_Workflows(unittest.TestCase):

	file = 'cache.json'
	cache = dict()

	def setUp(self):
		if os.path.exists(self.file):
			with open(self.file) as input:
				self.cache = json.load(input)

	def tearDown(self):
		with open(self.file, 'w') as output:
			json.dump(self.cache, output, indent='\t')
		gc.collect()

	#________________________________________________________________
	def test_01_start_workflow(self):

		workflows = Workflow()
		workflows.hostname = config['-H']
		workflows.username = config['-U']
		workflows.context = config['-C']

		workflow = workflows.get(workflow_id)
		render(workflow)
		assert workflow

		instance_id = workflows.start(workflow_id, product_id, id_as_base64=True)
		print(f'{colours.Green}{instance_id}{colours.Off}')
		assert(instance_id)
		self.cache['instance_id'] = instance_id

		del workflows

		print('waiting ...')
		time.sleep(5)

	#________________________________________________________________
	def test_02_search_tasks(self):

		tasks = Task()
		tasks.hostname = config['-H']
		tasks.username = 'WX_CORE_1'
		tasks.context = config['-C']

		task_ids = tasks.search(workflow_id, state_id='', node_id=product_id, id_as_base64=True)
		for task_id in task_ids:
			task = tasks.get(task_id)
			render(task)
			
			if 'instance_id' in self.cache.keys():
				instance_id = self.cache['instance_id']
				if 'instance' in task.keys():
					print(f'{colours.Green}{task["state"]}{colours.Off}')
					assert(task['state'] == state_id)
		
		del tasks

	#________________________________________________________________
	def test_03_terminate_instance(self):

		workflows = Workflow()
		workflows.hostname = config['-H']
		workflows.username = config['-U']
		workflows.context = config['-C']

		if 'instance_id' in self.cache.keys():
			instance_id = self.cache['instance_id']
			result = workflows.terminate(workflow_id, instance_id)
			#assert(result)
			render(result)
			print(f'{colours.Red}{instance_id}{colours.Off}')

		del workflows

#________________________________________________________________
class Test_02_Classifications(unittest.TestCase):

	file = 'cache.json'
	cache = dict()

	def setUp(self):
		if os.path.exists(self.file):
			with open(self.file) as input:
				self.cache = json.load(input)

	def tearDown(self):
		with open(self.file, 'w') as output:
			json.dump(self.cache, output, indent='\t')
		gc.collect()

	#________________________________________________________________
	def test_01_create_hierarchy(self):

		classifications = Classifications()
		classifications.hostname = config['-H']
		classifications.username = config['-U']
		classifications.context = config['-C']

		root = classifications.get('WX_Tags')
		print(f'{colours.Green}{root["name"]}{colours.Off}')
		assert(root)
		#render(root)
		assert(root['id'] == 'WX_Tags')

		now = datetime.now()
		dts = f'{now:%Y-%m-%d %H:%M:%S}'
		render(dict(created=dts))

		classification = classifications.create(root['id'], 'WX_Tag', f'created {dts}')
		render(classification)
		assert(classification)
		
		if 'classifications' not in self.cache.keys():
			self.cache['classifications'] = list()
		
		self.cache['classifications'].append(classification['id'])

#________________________________________________________________
class Test_03_Products(unittest.TestCase):

	file = 'cache.json'
	cache = dict()

	def setUp(self):
		if os.path.exists(self.file):
			with open(self.file) as input:
				self.cache = json.load(input)

	def tearDown(self):
		with open(self.file, 'w') as output:
			json.dump(self.cache, output, indent='\t')
		gc.collect()

	#________________________________________________________________
	def test_01_find_hierarchy(self):

		products = Products()
		products.hostname = config['-H']
		products.username = config['-U']
		products.context = config['-C']

		root = products.get('WX_Root')
		print(f'{colours.Green}{root["name"]}{colours.Off}')
		assert(root)
		#render(root)
		assert(root['id'] == 'WX_Root')

		children = products.children(root['id'])
		render(children)
		assert(children)
		assert(len(children))

		l1 = products.children(children[0])
		render(l1)
		assert(l1)
		assert(len(l1))

		l2 = products.children(l1[0])
		render(l2)
		assert(l2)
		assert(len(l2))
		
		l3 = products.children(l2[0])
		render(l3)
		assert(l3)
		assert(len(l3))
		
		product = products.get(l3[0])
		#render(product)
		assert(product)
		assert('id' in product.keys())
		assert(product['id'] == product_id)

		parent_id = product['parent']
		self.cache['parent_id'] = parent_id
		render(dict(parent_id=parent_id))

		del products

	#________________________________________________________________
	def test_02_create_product(self):

		products = Products()
		products.hostname = config['-H']
		products.username = config['-U']
		products.context = config['-C']

		assert('parent_id' in self.cache.keys())
		parent_id = self.cache['parent_id']

		now = datetime.now()
		dts = f'{now:%Y-%m-%d %H:%M:%S}'
		render(dict(created=dts))

		child = products.create(parent_id, 'WX_Product', f'created {dts}', values=[
			f'WX_activation_date={dts}',
			f'WX_brand_name=created by rest',
		])

		render(child)
		assert(child)
		assert('id' in child.keys())

		if 'products' not in self.cache.keys():
			self.cache['products'] = list()

		self.cache['products'].append(child['id'])

		del products

	#________________________________________________________________
	def test_03_update_product(self):

		products = Products()
		products.hostname = config['-H']
		products.username = config['-U']
		products.context = config['-C']

		assert('products' in self.cache.keys())

		now = datetime.now()
		dts = f'{now:%Y-%m-%d %H:%M:%S}'
		render(dict(updated=dts))

		for product_id in self.cache['products']:

			update = products.update(product_id, 'WX_description', f'modified {dts}')
			render(update)
			assert(update)

		del products

	#________________________________________________________________
	def test_04_range_product(self):

		products = Products()
		products.hostname = config['-H']
		products.username = config['-U']
		products.context = config['-C']

		assert('products' in self.cache.keys())

		now = datetime.now()
		dts = f'{now:%Y-%m-%d %H:%M:%S}'
		render(dict(ranged=dts))

		for product_id in self.cache['products']:
			reference = products.references(product_id, reference_id)
			render(reference)
			#todo skip if done already

			for classification_id in self.cache['classifications']:
				reference = products.reference(product_id, reference_id, classification_id, targetType='C', overwrite=True)
				render(reference)


	#________________________________________________________________
	def test_05_delete_product(self):

		products = Products()
		products.hostname = config['-H']
		products.username = config['-U']
		products.context = config['-C']

		assert('products' in self.cache.keys())

		now = datetime.now()
		dts = f'{now:%Y-%m-%d %H:%M:%S}'
		render(dict(deleted=dts))

		items = self.cache['products']

		for i in range(len(items)):
			#product_id = items.pop(0)
			product_id = items[i]
			print(product_id)
			#update = products.delete(product_id)
			#render(update)
			#assert(update)

		del products

#________________________________________________________________
class Test_04_Endpoints(unittest.TestCase):

	def setUp(self):
		pass

	def tearDown(self):
		gc.collect()

	#________________________________________________________________
	def test_01_endpoints(self):

		endpoints = Endpoints(asXML=True)
		endpoints.hostname = config['-H']
		endpoints.username = config['-U']
		#endpoints.verbose = True

		print(f'{colours.Green}{endpoints}{colours.Off}')
		assert endpoints

		result = endpoints.list()
		assert(result)

		_result = xmltodict.parse(result)
		assert('IntegrationEndpoints' in _result.keys())
		assert(len(_result['IntegrationEndpoints']))

		del endpoints

#________________________________________________________________
def main():
	level = logging.INFO
	#level = logging.DEBUG
	logging.basicConfig(level=level)
	logging.getLogger('botocore.credentials').setLevel(logging.CRITICAL)
	unittest.main(exit=True)

#________________________________________________________________
if __name__ == '__main__': main()

