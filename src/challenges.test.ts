import { getSolver } from './run';

const testChallenge = createMacro(
  async (day: number, part: 'a' | 'b') => {
    const solver = await getSolver(day, part);
    const result = await solver();

    expect(result).toMatchSnapshot();
  },
  (provided, day, part) => provided || `Challenge ${day}${part}`,
);

run(testChallenge, 1, 'a');
run(testChallenge, 1, 'b');
run(testChallenge, 2, 'a');
run(testChallenge, 2, 'b');
run(testChallenge, 2, 'a');
run(testChallenge, 3, 'a');
run(testChallenge, 4, 'a');
run(testChallenge, 4, 'b');
run(testChallenge, 5, 'a');
run(testChallenge, 5, 'b');
run(testChallenge, 6, 'a');
run(testChallenge, 6, 'b');
run(testChallenge, 7, 'a');
