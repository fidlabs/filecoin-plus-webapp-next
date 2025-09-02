export interface Node {
  name: string;
}

export interface Link {
  source: number;
  target: number;
  value: number;
}

type SankeyTreeExtras = Record<string, unknown>;

export type SankeyTree<E extends SankeyTreeExtras = {}> = {
  name: string;
  value: number;
  leafs: SankeyTree<E>[];
} & E;

function* createIndexGenerator(): Generator<number, number> {
  let index = 0;

  while (true) {
    yield index++;
  }
}

export function getNodesFromSankeyTree<T extends SankeyTreeExtras = {}>(
  tree: SankeyTree<T>
): Array<Node & T> {
  const { name, leafs, ...restOfTree } = tree;

  return [
    {
      ...(restOfTree as unknown as T),
      name: tree.name,
    },
    ...tree.leafs.flatMap(getNodesFromSankeyTree),
  ];
}

export function getLinksFromSankeyTree<T extends SankeyTreeExtras>(
  tree: SankeyTree<T>,
  DONT_PASS__index_generator: Generator<
    number,
    number
  > = createIndexGenerator(),
  DONT_PASS__source: number = 0
): Link[] {
  const index = DONT_PASS__index_generator.next().value;

  if (index === 0) {
    if (tree.leafs.length === 0) {
      return [];
    }

    return tree.leafs.flatMap((leaf) =>
      getLinksFromSankeyTree(leaf, DONT_PASS__index_generator, index)
    );
  }

  return [
    {
      source: DONT_PASS__source,
      target: index,
      value: tree.value,
    },
    ...tree.leafs.flatMap((leaf) =>
      getLinksFromSankeyTree(leaf, DONT_PASS__index_generator, index)
    ),
  ];
}
