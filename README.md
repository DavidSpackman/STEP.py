# STEP.py

python libraries to support Stibo STEP MDM APIs

## step2uml.py
```
$ step2uml.py -h
usage: step2uml.py [-h] {toUML,args} ...

convert STEP to UML

positional arguments:
  {toUML,args}  operations
    toUML       make an UML XMI file from a STEP.XML input
    args        print the values for the args

optional arguments:
  -h, --help    show this help message and exit

```

## excel2step.py
```
$ excel2step.py -h
usage: excel2step.py [-h] [--context CONTEXT] [--prefix PREFIX] [--workspace WORKSPACE] {make_lovs,process,args} ...

tool to convert excel into step xml formats

positional arguments:
  {make_lovs,process,args}
                        operations
    make_lovs           process an excel file to create a STEP LOV xml import
                        | ID | Name |
                        |----+------|
                        | a  | aye  |
                        | b  | bee  |
                        |----+------|
                        <group_id=sheet_name/>
    process             process an excel file to create a STEP import
                        | Class  | CSV        | Name | Type    | Length | 
                        |--------+------------+------+---------+--------|
                        | Group1 | group1.csv | id   | varchar | 40     |
                        | Group1 | group1.csv | name | varchar | 256    |
    args                print the values for the args

optional arguments:
  -h, --help            show this help message and exit
  --context CONTEXT     step context id, default=Context1
  --prefix PREFIX       prefix to use on ID definitions, default=PIM
  --workspace WORKSPACE
                        step workspace id, default=Main

```

## step.rest.py
```
$ step.rest.py -h
usage: step.rest.py [-h]
                    {step,assets,processes,instances,objects,products,entities,classifications,endpoints,args} ...

positional arguments:
  {step,assets,processes,instances,objects,products,entities,classifications,endpoints,args}
                        commands
    step                base class to store the common properties and operations
    assets              MIME type assets
    processes           background processes running on STEP
    instances           background processes instances running on STEP
    objects
    products
    entities
    classifications
    endpoints
    args                print the values for the args

optional arguments:
  -h, --help            show this help message and exit

```

## step.soap.py
```
$ step.soap.py -h
usage: step.soap.py [-h] [-H HOSTNAME] [-p PASSWORD] [-u USERNAME] [-v] [-w WSDLPATH] [-o OUTPUT] [-c]
                    {addClassification,approve,createClassification,createProduct,createReference,deleteNode,describe,directory,dummy,getAttributeDetails,getBaseProduct,getChildren,getClassifications,getLOVValueIDs,getName,getNodeDetails,getPath,getReferenceTypes,getReferences,getTasks,getValidChildTypes,getValues,getWorkflowProcessDetail,getWorkflowProcesses,getWorkspaces,moveNode,queryByAttribute,queryById,service,setName,setValues,startWorkflow,types,args}
                    ...

positional arguments:
  {addClassification,approve,createClassification,createProduct,createReference,deleteNode,describe,directory,dummy,getAttributeDetails,getBaseProduct,getChildren,getClassifications,getLOVValueIDs,getName,getNodeDetails,getPath,getReferenceTypes,getReferences,getTasks,getValidChildTypes,getValues,getWorkflowProcessDetail,getWorkflowProcesses,getWorkspaces,moveNode,queryByAttribute,queryById,service,setName,setValues,startWorkflow,types,args}
                        operations
    addClassification
    approve
    createClassification
    createProduct
    createReference
    deleteNode
    describe            describe a method
    directory           print out the client specification
    dummy               describe a method
    getAttributeDetails
    getBaseProduct
    getChildren
    getClassifications
    getLOVValueIDs
    getName
    getNodeDetails
    getPath
    getReferenceTypes
    getReferences
    getTasks
    getValidChildTypes
    getValues
    getWorkflowProcessDetail
    getWorkflowProcesses
    getWorkspaces
    moveNode
    queryByAttribute
    queryById
    service
    setName
    setValues
    startWorkflow
    types               print out the client types
    args                print the values for the args

optional arguments:
  -h, --help            show this help message and exit
  -H HOSTNAME, --hostname HOSTNAME
                        default=http://host
  -p PASSWORD, --password PASSWORD
  -u USERNAME, --username USERNAME
                        default=stepsys
  -v, --verbose
  -w WSDLPATH, --wsdlpath WSDLPATH
                        default=StepWS/stepws?wsdl
  -o OUTPUT, --output OUTPUT
                        output to file
  -c, --colour          in colour
  ```
  



