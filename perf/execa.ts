import execa from 'execa';

const time = process.hrtime.bigint();
for (let i = 0; i < 1000; i += 1) {
	execa.commandSync('echo "hi"');
}
const diff = process.hrtime.bigint() - time;
console.log(diff / 1_000_000n);
