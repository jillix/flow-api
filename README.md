# flow-api

#### Environment
```js
scope.env.FlowApiStore = {/*Store config*/};
```

#### Result
```js
data.readable = ReadableObjectStream();
```

## Public Methods
#### sequence
```js
data.id = "nodeId";
data.role = "roleId";
```
#### getOutNodes
```js
data.from = "nodeId";
data.out = ["predicate"];
```
#### getNodeData
```js
data.node = "nodeId";
```
#### getNodeName
```js
data.node = "nodeId";
```
#### setNodeData
```js
data.id = "nodeId";
data.data = {};
```
#### setNodeName
```js
data.id = "nodeId";
data.name = "Node Name!@#";
```
#### addOutNode
```js
data.add = "FromNodeId";
data.out = "predicate";
data.node = "ToNodeId";
```
#### addOutCreate
```js
data.add = "FromNodeId";
data.out = "predicate";
data.create = {
    name: "Node name!#@",
    data: {}
};
```
#### setOutNode
```js
data.set = "FromNodeId";
data.out = "predicate";
data.node = "ToNodeId";
```
#### setOutCreate
```js
data.set = "FromNodeId";
data.out = "predicate";
data.create = {
    name: "Node name!#@",
    data: {}
};
```
#### removeNode
```js
data.node = "nodeId";
```
#### removeOut
```js
data.node = "nodeId";
data.out = ["predicate"];
```
#### search
```js
data.query = "Search query";
data.filters = {
    type: "nodeType",
    start: "nodeId"
};
```
## Store API
#### sequence
* *NodeId*
* *roleId*

#### entrypoint
* *NodeName*

#### outNodes
* *NodeId*

#### getObject
* *NodeId*

#### incomming
* *NodeId*

#### outgoing
* *NodeId*

#### remove
* *triples*: Array of triples to delete.

#### write
* *triples*: Array of triples to write.
