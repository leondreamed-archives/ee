use indexmap::IndexSet;
use std::fs::File;
use std::io::Write;

use rand::Rng;

struct CallTree {
    num_nodes: u32,
    max_children: u32,
    adj: Vec<Vec<u32>>,
    unlinked_nodes: IndexSet<u32>,
}

impl CallTree {
    pub fn new(num_nodes: u32, max_children: u32) -> Self {
        println!("Initializing CallTree...");
        let mut call_tree = Self {
            adj: vec![Vec::new() as Vec<u32>; num_nodes as usize],
            unlinked_nodes: IndexSet::new(),
            num_nodes,
            max_children,
        };

        for i in 1..num_nodes {
            call_tree.unlinked_nodes.insert(i);
        }

        println!("Linking nodes...");
        call_tree.link_nodes();

        call_tree
    }

    fn get_random_unlinked_node(&mut self) -> u32 {
        let random_index = rand::thread_rng().gen_range(0..self.unlinked_nodes.len());
        let random_unlinked_node = self
            .unlinked_nodes
            .get_index(random_index)
            .unwrap()
            .to_owned();
        self.unlinked_nodes.remove(&random_unlinked_node);
        return random_unlinked_node;
    }

    fn link_nodes(&mut self) {
        for i in 0..self.num_nodes {
            // If node is already linked, continue
            if i != 0 && !self.unlinked_nodes.contains(&i) {
                continue;
            }

            if i != 0 {
                self.unlinked_nodes.remove(&i);
                self.adj[(i - 1) as usize].push(i);
            }

            let num_children = rand::thread_rng().gen_range(0..=self.max_children);
            for i in 0..num_children {
                if self.unlinked_nodes.len() == 0 {
                    return;
                }

                let random_unlinked_node = self.get_random_unlinked_node();
                self.adj[i as usize].push(random_unlinked_node);
            }
        }
    }

    fn write_to_file(&self) {
        let tree_json = serde_json::to_string(&self.adj).unwrap();
        let mut f = File::create(format!(
            "../../generated/call-trees/{}.json",
            self.num_nodes
        ))
        .unwrap();
        f.write_all(tree_json.as_bytes()).unwrap();
    }
}

fn main() {
    let num_nodes_vec = vec![
        10, 20, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_000, 8_000, 9_000, 10_000
		];
    for num_nodes in num_nodes_vec {
        println!("Generating call tree with {} functions...", num_nodes);
        CallTree::new(num_nodes, 10).write_to_file();
    }
}
