import type p from 'p5';

export type P5 = InstanceType<typeof p>;

declare global {
	var p5: typeof p;
}