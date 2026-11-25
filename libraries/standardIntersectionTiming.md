The measured time to "find intersections".
Here is some data.
|Number of Segments| Time (ms) |
|------------------|-----------|
|300               | 0.76|
|3000|39|
|6000|153|
|9000|349|
|12000|620|
|15000|997|
|20000|1822|
|24000|2608|
|30000|3881|


The clock time to create and pre-process the segments has also been measured and it is negligible. To preProcess 30,000 random segments takes only about 55 ms and the clock time is seemingly instantanous.