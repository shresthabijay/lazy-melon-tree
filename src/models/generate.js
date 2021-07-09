import { commentBodies } from './randomData'

const fuzzCount = count => {
  // makes the number randomly a little larger or smaller for fake data to seem more realistic
  const maxFuzz = 4
  const fuzz = Math.round((Math.random() - 0.5) * maxFuzz * 2)
  return count + fuzz
}

const makeNode = (db, value) =>
  db.collections.get('nodes').prepareCreate(node => {
    node.value = value
  })

const makeNodeChildren = (db, childId, parentNode) =>
  db.collections.get('node_children').prepareCreate(nodeChild => {
    nodeChild.nodeId = childId
    nodeChild.parentNode.set(parentNode)
  })

const createRecursiveTreeData = (db, maxDepth, maxWidth, parentNode, currentDepth = 0, isMainPath = true) => {

  if (!isMainPath || currentDepth > maxDepth) return {
    nodes: [],
    childNodes: []
  } 

  return Array.from({ length: maxWidth }).reduce((acc, _, index) => {

    const value = commentBodies[Math.abs(fuzzCount(maxWidth)) % (commentBodies.length - 1)]

    const node = makeNode(db, value)
  
    const childNode = makeNodeChildren(db, node.id, parentNode)

    const recursiveTreeNodes = createRecursiveTreeData(db, maxDepth, maxWidth, node, currentDepth + 1, isMainPath && index === 0)

    return {
      nodes: [...acc.nodes, node, ...recursiveTreeNodes.nodes],
      childNodes: [...acc.childNodes, childNode, ...recursiveTreeNodes.childNodes],
    }
  }, { nodes: [], childNodes: [] })
}

export const generateRandomTree = async (db, depth, width) => 
  db.action(
    async () => {
      await db.unsafeResetDatabase()

      const rootNode = makeNode(db, '__ROOT__')
      const { nodes, childNodes } = createRecursiveTreeData(db, depth, width, rootNode)
      const allRecords = [rootNode, ...nodes, ...childNodes]

      await db.batch(...allRecords)
      return allRecords.length
    }
  )
