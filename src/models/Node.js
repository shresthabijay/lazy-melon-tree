import { Model } from '@nozbe/watermelondb'
import { field, relation, children, action } from '@nozbe/watermelondb/decorators'

export default class Node extends Model {
  static table = 'nodes'

  static associations = {
    node_children: { type: 'has_many', foreignKey: 'parent_id' },
  }

  @field('value')
  value

  @children('node_children')
  children
}
