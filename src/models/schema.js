import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'nodes',
      columns: [
        { name: 'value', type: 'string' }
      ],
    }),
    tableSchema({
      name: 'node_children',
      columns: [
        { name: 'node_id', type: 'string' },
        { name: 'parent_id', type: 'string' }
      ],
    })
  ],
})
