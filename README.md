# flow-api

Environment (`scope.env`)
```json
{
    "FlowApiStore": {/*Store config*/}
}
```

Result (`data`)
```js
{
    "readable": ReadableObjectStream()
}
```

### Public Methods
#####sequence
Data
```json
{
    "id": "nodeId",
    "role": "roleId"
}
```

#####getOutNodes
Data
```json
{
    "from": "nodeId",
    "out": ["predicate"]
}
```
#####getNodeData
Data
```json
{
    "node": "nodeId"
}
```
#####getNodeName
Data
```json
{
    "node": "nodeId"
}
```
#####setNodeData
Data
```json
{
    "id": "nodeId",
    "data": {}
}
```
#####setNodeName
Data
```json
{
    "id": "nodeId"
    "name": "Node Name!@#"
}
```
#####addOutNode
Data
```json
{
    "add": "FromNodeId",
    "out": "predicate",
    "node": "ToNodeId"
}
```
#####addOutCreate
Data
```json
{
    "add": "FromNodeId",
    "out": "predicate",
    "create": {
        "name": "Node name!#@",
        "data": {}
    }
}
```
#####setOutNode
Data
```json
{
    "set": "FromNodeId",
    "out": "predicate",
    "node": "ToNodeId"
}
```
#####setOutCreate
Data
```json
{
    "set": "FromNodeId",
    "out": "predicate",
    "create": {
        "name": "Node name!#@",
        "data": {}
    }
}
```
#####removeNode
Data
```json
{
    "node": "nodeId"
}
```
#####removeOut
Data
```json
{
    "node": "nodeId",
    "out": ["predicate"]
}
```
/search/type/[string]
/search/out/[string]

## Store API
sequence
entrypoint
outNodes
getObject
incomming
outgoing
remove
write
