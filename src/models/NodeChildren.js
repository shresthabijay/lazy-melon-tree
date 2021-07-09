import { Model } from '@nozbe/watermelondb'
import { field, relation, children, action } from '@nozbe/watermelondb/decorators'

export default class NodeChildren extends Model {
  static table = 'node_children'

  static associations = {
    nodes: { type: 'belongs_to', key: 'parent_id' },
  }

  @field('node_id')
  nodeId

  @relation('nodes', 'parent_id')
  parentNode
}
