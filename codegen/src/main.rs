use indoc::formatdoc;
use std::fs;

struct RustGenerator {
    num_declarations: usize,
    mutable: bool,
    adj_list: Vec<Vec<u32>>,
}

impl RustGenerator {
    pub fn new(file_path: &str, mutable: bool) -> Self {
        let adj_list: Vec<Vec<u32>> =
            serde_json::from_str(&fs::read_to_string(file_path).expect("Failed to read file"))
                .expect("Failed to parse json");
        Self {
            num_declarations: adj_list.len(),
            adj_list,
            mutable,
        }
    }

    fn get_ref(&self, term: &str, mutable: bool) -> String {
        if mutable {
            "&mut ".to_string() + term
        } else {
            "&".to_owned() + term
        }
    }

    fn gen_function_declarations(&self) -> String {
        let mut declarations = String::new();
        for i in 0..self.num_declarations {
            let header = format!(
                "fn f{}(_vec: {}) {{",
                i,
                self.get_ref("Vec<i32>", self.mutable)
            );
            let mutation = if self.mutable {
                format!("_vec[{}] = {};", i, i + 1)
            } else {
                "".to_string()
            };
            let calls = self.adj_list[i]
                .iter()
                .map(|node| format!("f{}({});", node, self.get_ref("_vec", self.mutable)))
                .collect::<Vec<String>>()
                .join("\n\t");

            declarations.push_str(&formatdoc! {"
							{header}
								{mutation}{calls}
							}}

						", header = header, mutation = mutation, calls = calls});
        }
        declarations
    }

    pub fn run(&self) {
        let function_declarations = self.gen_function_declarations();
        let rust_code = formatdoc! {"
						{function_declarations}
						fn main() {{
							let mut vec = Vec::with_capacity({num_functions});
							for i in 0..{num_functions} {{
								vec.push(i);
							}}

							f0({vec_ref});
						}}",
                        function_declarations = function_declarations,
            num_functions = self.num_declarations,
            vec_ref = self.get_ref("vec", self.mutable)
        };

        fs::write(
            format!("../generated/programs/calls-{}.rs", self.num_declarations),
            rust_code,
        )
        .expect("Failed to write calls.rs");
    }
}

struct CPPGenerator {
    num_declarations: usize,
    mutable: bool,
    adj_list: Vec<Vec<u32>>,
}

impl CPPGenerator {
    pub fn new(file_path: &str, mutable: bool) -> Self {
        let adj_list: Vec<Vec<u32>> =
            serde_json::from_str(&fs::read_to_string(file_path).expect("Failed to read file"))
                .expect("Failed to parse json");
        Self {
            num_declarations: adj_list.len(),
            adj_list,
            mutable,
        }
    }

    fn gen_function_headers(&self) -> String {
        let mut headers = String::new();
        for i in 0..self.num_declarations {
            headers.push_str(&format!("void f{}(vector<int> &vec);\n", i));
        }
        headers
    }

    fn gen_function_declarations(&self) -> String {
        let mut declarations = String::new();
        for i in 0..self.num_declarations {
            declarations.push_str(&format!("void f{}(vector<int> &vec) {{\n", i));
            if self.mutable {
                declarations.push_str(&format!("vec[{}] = {};", i, i + 1));
            }
            declarations.push_str(
                &self.adj_list[i]
                    .iter()
                    .map(|node| format!("f{}(vec);", node))
                    .collect::<Vec<String>>()
                    .join("\n"),
            );
            declarations.push_str("\n}\n");
        }
        declarations
    }

    pub fn run(&self) {
        let cpp_code = formatdoc! {
            r#"
				#include <vector>
				#include <cstdio>
				using namespace std;

				{function_headers}
				{function_declarations}

				int main() {{
					vector<int> vec;
					vec.reserve({num_functions});
					for (int i = 0; i < {num_functions}; i += 1) {{
						vec.push_back(i);
					}}

					f0(vec);
				}}
			"#,
            num_functions = self.num_declarations,
            function_headers = self.gen_function_headers(),
            function_declarations = self.gen_function_declarations()
        };

        fs::write(
            format!("../generated/programs/calls-{}.cpp", self.num_declarations),
            cpp_code,
        )
        .expect("Failed to write calls.rs");
    }
}

fn main() {
    let call_tree_files = fs::read_dir("../generated/call-trees").expect("Failed to read dir");
    for call_tree_path in call_tree_files {
        let path = call_tree_path.unwrap().path().display().to_string();
        RustGenerator::new(&path, false).run();
        CPPGenerator::new(&path, false).run();
    }
}
