import init, { print_syntax_tree  } from "./lparso.js";

async function main() {
  await init();
  const input = document.querySelector("#playground > .input");
  const output = document.querySelector("#playground > .output");

  function update(text) {
    output.textContent = print_syntax_tree(text);
  }
  input.addEventListener("input", (event) => update(event.target.value));
  update(input.textContent);
}

main();
