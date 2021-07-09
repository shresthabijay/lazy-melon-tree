// @flow

import React from 'react'
import { render } from 'react-dom'

import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider'

import { mySchema } from 'models/schema'

import Tree from './components/Tree'
import Node from './models/Node'
import NodeChildren from './models/NodeChildren'

const adapter = new LokiJSAdapter({
  dbName: 'LazyLoadedMelonTree',
  schema: mySchema,
})

const database = new Database({
  adapter,
  modelClasses: [Node, NodeChildren],
  actionsEnabled: true,
})

render(
  <DatabaseProvider database={database}>
    <Tree/>
  </DatabaseProvider>, document.getElementById('application')
)
