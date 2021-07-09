import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { Q } from '@nozbe/watermelondb'
import withObservables from '@nozbe/with-observables'
import { compose } from 'rambdax'
import React, { createContext, useContext, useState } from 'react'
import { generateRandomTree } from '../../models/generate'
import style from './style.css'

const DEFAULT_CURSOR_DEPTH = 5

const CursorContext = createContext()

const CursorProvider = ({ children }) => {
  const [cursor, setCursor] = useState(null)
  const [cursorDepth, setCursorDepth] = useState(DEFAULT_CURSOR_DEPTH)
  return <CursorContext.Provider value={{ cursor, setCursor, cursorDepth, setCursorDepth }}>{children}</CursorContext.Provider>
}

const GenerateTree = withDatabase(({ database }) => {

  const { setCursorDepth } = useContext(CursorContext)

  const generateTree = async (depth, width) => {
    const dataCount = await generateRandomTree(database, depth, width)
    alert(`${dataCount} records added!`)
  }

  return (
    <>
      <section>
        <h3>Generate tree with given depth with only one node per depth</h3>
        <button onClick={() => generateTree(100, 1)}>Generate Tree (100 depth)</button>
        <button style={{ marginLeft: '10px' }}onClick={() => generateTree(1000, 1)}>Generate (1000 depth)</button>
      </section>
      <section>
        <h3>Set number of visible nodes from the active node</h3>
        <button onClick={() => setCursorDepth(DEFAULT_CURSOR_DEPTH)}>Cursor Depth {DEFAULT_CURSOR_DEPTH}</button>
        <button style={{ marginLeft: '10px' }}onClick={() => setCursorDepth(20)}>Cursor Depth 20</button>
      </section>
    </>
  )
})

const Tree = () => {
  return (
    <main>
      <h1>Lazy Loaded Melon Tree 🍉</h1>
      <CursorProvider>
        <GenerateTree/>
        <RecursiveNode/>
      </CursorProvider>
    </main>
  )
}

const KNode = ({ node, children, depthFromCursor  }) => {

  const { cursor, setCursor, cursorDepth } = useContext(CursorContext)

  const isRoot = node.value === '__ROOT__'
  const isCursor = (cursor === node.id) || (!cursor && isRoot)

  const hideChildren = depthFromCursor && depthFromCursor >= cursorDepth

  const hasChildren = children && children.length > 0

  return (
    <li className='node'>
      <span className={`${style.node} ${isCursor ? style.cursor : ''}`} onClick={() => setCursor(node.id)}>{node?.value}</span>

      {hideChildren && hasChildren && <button className={style.expandButton} onClick={() => setCursor(node.id)}>Expand</button>}
      {
        !hideChildren && <ul>
          {children && children.map((child) => {
            return <Node key={child.id} nodeId={child.nodeId} depthFromCursor={depthFromCursor !== undefined ? (depthFromCursor + 1) : (isCursor ? 0 : undefined)}/>
          })}
        </ul>
      }
    </li>
  )
}

const enhance = compose(
  withObservables(['nodeId'], ({ nodeId, database }) => ({
    node: database.collections.get('nodes').findAndObserve(nodeId),
  })),
  withObservables(['node'], ({ node }) => ({
    children: node.children.observe(),
  }))
)

const Node = withDatabase(enhance(KNode))

// TODO: rootNodes observable is not emiting anything after db.unsafeResetDatabase() is called. So after generating new set of data page is being needed to refresh.
const rootNodeEnhance = compose(
  withObservables([], ({ database }) => ({
    rootNodes: database.collections.get('nodes').query(Q.where('value', '__ROOT__')).observe(),
  })),  
)

const KRecursiveNode= ({ rootNodes }) => {
  
  const rootNode = rootNodes?.[0]

  return (
    <ul>
      {rootNode && <Node nodeId={rootNode.id} /> }
    </ul>
  )
}

const RecursiveNode = withDatabase(rootNodeEnhance(KRecursiveNode))

export default Tree