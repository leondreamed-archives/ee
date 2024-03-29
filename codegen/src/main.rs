use indoc::formatdoc;
use std::fs;

struct RustGenerator {
  num_declarations: usize,
  adj_list: Vec<Vec<u32>>,
}

impl RustGenerator {
  pub fn new(file_path: &str) -> Self {
    let adj_list: Vec<Vec<u32>> =
      serde_json::from_str(&fs::read_to_string(file_path).expect("Failed to read file"))
        .expect("Failed to parse json");
    Self {
      num_declarations: adj_list.len(),
      adj_list,
    }
  }

  /*
  fn f1(v: Arc<Vec<u32>>) {
      {
          let vec = v.clone();
          thread::spawn(move || {
              f2(vec)
          })
      }
  }
  */
  fn gen_function_declarations(&self) -> String {
    let mut declarations = String::new();
    let mut add_declaration = |i: usize| {
      declarations.push_str(&format!("fn f{}(v: Arc<Vec<u32>>) {{\n", i));
      declarations.push_str(&format!("let mut sum = {}; for i in v.iter() {{ sum += *i }}; if sum == {} {{ println!(\"Found sum\") }}\n", i, (0..self.num_declarations).sum::<usize>()));
      self.adj_list[i].iter().for_each(|node| {
        declarations.push_str(&formatdoc! {"
                  let t{node} = {{
                    let vec = v.clone();
                    thread::spawn(move || {{
                      f{node}(vec);
                    }})
                  }};
                ", node = node})
      });

      for node in self.adj_list[i].iter() {
        declarations.push_str(&format!("t{}.join().unwrap();\n", node));
      }

      declarations.push_str("}\n");
    };

    for i in 0..self.num_declarations {
      add_declaration(i);
    }
    declarations
  }

  fn gen_paramless_function_declarations(&self) -> String {
    let mut declarations = String::new();
    let mut add_declaration = |i: usize| {
      declarations.push_str(&format!("fn f{}() {{\n", i));
      self.adj_list[i].iter().for_each(|node| {
        declarations.push_str(&formatdoc! {"
                  f{node}();
                ", node = node})
      });

      declarations.push_str("}\n");
    };

    for i in 0..self.num_declarations {
      add_declaration(i);
    }
    declarations
  }

  fn gen_mutable_function_declarations(&self) -> String {
    let mut declarations = String::new();
    let mut add_declaration = |i: usize| {
      declarations.push_str(&format!("fn f{}(v: Arc<RwLock<Vec<u32>>>) {{\n", i));
      self.adj_list[i].iter().for_each(|node| {
        declarations.push_str(&formatdoc! {"
                  let t{node} = {{
                    let v = v.clone();
                    thread::spawn(move || {{
                      f{node}(v);
                    }})
                  }};
                ", node = node})
      });

      for node in self.adj_list[i].iter() {
        declarations.push_str(&format!("t{}.join().unwrap();\n", node));
      }

      declarations.push_str("let mut vec = v.write().unwrap();\n");
      declarations.push_str(&format!("let mut sum = {};\n", i));
      declarations.push_str(&format!(
        "for i in 0..{} {{ sum += vec[i]; }}\n",
        self.num_declarations
      ));
      declarations.push_str(&format!(
        "vec[{num_functions} + {}] = sum;\n",
        i,
        num_functions = self.num_declarations
      ));
      declarations.push_str("}\n");
    };

    for i in 0..self.num_declarations {
      add_declaration(i);
    }
    declarations
  }

  pub fn run(&self) {
    let function_declarations = self.gen_function_declarations();
    let rust_code = formatdoc! {"
            use std::sync::Arc;
            use std::thread;
            {function_declarations}
            fn main() {{
              let mut vec = Vec::with_capacity({num_functions});
              for i in 0..{num_functions} {{
                vec.push(i);
              }}
              let v = Arc::new(vec);

              f0(v);
            }}",
        function_declarations = function_declarations,
        num_functions = self.num_declarations,
    };

    fs::write(
      format!("../generated/programs/calls-{}.rs", self.num_declarations),
      rust_code,
    )
    .expect("Failed to write calls.rs");
  }

  pub fn run_mutable(&self) {
    let function_declarations = self.gen_mutable_function_declarations();
    let rust_code = formatdoc! {"
            use std::sync::{{Arc, RwLock}};
            use std::thread;
            {function_declarations}
            fn main() {{
              let mut vec = vec![0u32; {num_functions} * 2];
              for i in 0..{num_functions} {{
                vec[i] = i as u32;
              }}
              let v = Arc::new(RwLock::new(vec));

              f0(v);
            }}",
        function_declarations = function_declarations,
        num_functions = self.num_declarations,
    };

    fs::write(
      format!(
        "../generated/programs/calls-mut-{}.rs",
        self.num_declarations
      ),
      rust_code,
    )
    .expect("Failed to write calls-mut.rs");
  }

  pub fn run_paramless(&self) {
    let function_declarations = self.gen_paramless_function_declarations();
    let rust_code = formatdoc! {"
            {function_declarations}
            fn main() {{
              f0();
            }}",
        function_declarations = function_declarations,
    };

    fs::write(
      format!(
        "../generated/programs/calls-paramless-{}.rs",
        self.num_declarations
      ),
      rust_code,
    )
    .expect("Failed to write calls.rs");
  }
}

struct CPPGenerator {
  num_declarations: usize,
  adj_list: Vec<Vec<u32>>,
}

impl CPPGenerator {
  pub fn new(file_path: &str) -> Self {
    let adj_list: Vec<Vec<u32>> =
      serde_json::from_str(&fs::read_to_string(file_path).expect("Failed to read file"))
        .expect("Failed to parse json");
    Self {
      num_declarations: adj_list.len(),
      adj_list,
    }
  }

  fn gen_function_headers(&self) -> String {
    let mut headers = String::new();
    for i in 0..self.num_declarations {
      headers.push_str(&format!("void f{}(vector<int> &vec);\n", i));
    }
    headers
  }

  fn gen_paramless_function_headers(&self) -> String {
    let mut headers = String::new();
    for i in 0..self.num_declarations {
      headers.push_str(&format!("void f{}();\n", i));
    }
    headers
  }

  fn gen_function_declarations(&self) -> String {
    let mut declarations = String::new();
    for i in 0..self.num_declarations {
      declarations.push_str(&format!("void f{}(vector<int> &vec) {{\n", i));
      declarations.push_str(&format!(
        "int sum = {}; for (int i : vec) sum += i; if (sum == {}) printf(\"Found sum\");\n",
        i,
        (0..self.num_declarations).sum::<usize>()
      ));
      for node in self.adj_list[i].iter() {
        declarations.push_str(&format!(
          "thread t{node}(f{node}, ref(vec));\n",
          node = node
        ));
      }
      for node in self.adj_list[i].iter() {
        declarations.push_str(&format!("t{}.join();\n", node));
      }
      declarations.push_str("}\n");
    }
    declarations
  }

  fn gen_paramless_function_declarations(&self) -> String {
    let mut declarations = String::new();
    for i in 0..self.num_declarations {
      declarations.push_str(&format!("void f{}() {{\n", i));
      for node in self.adj_list[i].iter() {
        declarations.push_str(&format!("f{node}();\n", node = node));
      }
      declarations.push_str("}\n");
    }
    declarations
  }

  fn gen_mutable_function_declarations(&self) -> String {
    let mut declarations = String::new();
    for i in 0..self.num_declarations {
      declarations.push_str(&format!("void f{}(vector<int> &vec) {{\n", i));
      declarations.push_str(&format!(
        "int sum = {}; for (int i = 0; i < {}; i += 1) sum += vec[i];\n",
        i, self.num_declarations
      ));
      declarations.push_str(&format!("vec[{}] = sum;\n", i));
      for node in self.adj_list[i].iter() {
        declarations.push_str(&format!(
          "thread t{node}(f{node}, ref(vec));\n",
          node = node
        ));
      }
      for node in self.adj_list[i].iter() {
        declarations.push_str(&format!("t{}.join();\n", node));
      }
      declarations.push_str("}\n");
    }
    declarations
  }

  pub fn run(&self) {
    let cpp_code = formatdoc! {
        r#"
        #include <vector>
        #include <cstdio>
        #include <thread>
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
    .expect("Failed to write calls.cpp");
  }

  pub fn run_mutable(&self) {
    let cpp_code = formatdoc! {
        r#"
        #include <vector>
        #include <cstdio>
        #include <thread>
        using namespace std;

        {function_headers}
        {function_declarations}

        int main() {{
          vector<int> vec;
          vec.resize({num_functions} * 2);
          for (int i = 0; i < {num_functions}; i += 1) {{
            vec[i] = i;
            vec[{num_functions} + i] = 0;
          }}

          f0(vec);
        }}
      "#,
        num_functions = self.num_declarations,
        function_headers = self.gen_function_headers(),
        function_declarations = self.gen_mutable_function_declarations()
    };

    fs::write(
      format!(
        "../generated/programs/calls-mut-{}.cpp",
        self.num_declarations
      ),
      cpp_code,
    )
    .expect("Failed to write calls-mut.cpp");
  }

  pub fn run_paramless(&self) {
    let cpp_code = formatdoc! {
        r#"
        #include <vector>
        #include <cstdio>
        #include <thread>
        using namespace std;

        {function_headers}
        {function_declarations}

        int main() {{
          f0();
        }}
      "#,
        function_headers = self.gen_paramless_function_headers(),
        function_declarations = self.gen_paramless_function_declarations()
    };

    fs::write(
      format!(
        "../generated/programs/calls-paramless-{}.cpp",
        self.num_declarations
      ),
      cpp_code,
    )
    .expect("Failed to write calls.cpp");
  }
}

fn main() {
  let call_tree_files = fs::read_dir("../generated/call-trees").expect("Failed to read dir");
  for call_tree_path in call_tree_files {
    let path = call_tree_path.unwrap().path().display().to_string();
    let rust_generator = RustGenerator::new(&path);
    rust_generator.run();
    rust_generator.run_mutable();
    rust_generator.run_paramless();
    let cpp_generator = CPPGenerator::new(&path);
    cpp_generator.run();
    cpp_generator.run_mutable();
    cpp_generator.run_paramless();
  }
}
