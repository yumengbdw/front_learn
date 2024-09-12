1. nodejs 的架构

第一层：natives modules
第二层 Node C/C++ bindings
最低层 v8 libuv c-ares（DNS）http parser zlib（compression）

主要是处理 IO 密集型的高并发请求，并不适用处理逻辑复杂的
