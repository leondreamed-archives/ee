export type FilenameToResultMap = Record<string, bigint>;
export type FilenameToResultsMap = Record<string, bigint[]>;

export type OverallResults = {
	compilationTime: {
		immutableState: {
			cpp: FilenameToResultsMap;
			rust: FilenameToResultsMap;
		};
		mutableState: {
			cpp: FilenameToResultsMap;
			rust: FilenameToResultsMap;
		};
		paramless: {
			cpp: FilenameToResultsMap;
			rust: FilenameToResultsMap;
		};
	};
	runTime: {
		immutableState: {
			cpp: FilenameToResultsMap;
			rust: FilenameToResultsMap;
		};
		mutableState: {
			cpp: FilenameToResultsMap;
			rust: FilenameToResultsMap;
		};
	};
};
