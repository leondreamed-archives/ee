import fs from 'fs';

const results = fs.readFileSync('results.txt').toString();

for (const r of results.split('\n')) {
	const [name, time] = r.split(' ');
	const milliseconds = Number(time.slice(0, -1)) / 1_000_000;
	const shortName = name.split('/').at(-1);
	console.log(`${shortName},${milliseconds}`);
}