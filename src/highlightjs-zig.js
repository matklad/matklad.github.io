export default (e)=>({name:"Zig",
aliases:["zig"],
keywords:"pub align allowzero and asm async await break catch comptime|10 const continue defer else enum errdefer export extern false fn for if inline noalias null or orelse packed promise resume return linksection struct suspend nosuspend noinline callconv switch test threadlocal true try undefined union unreachable|10 usingnamespace var volatile while error",
contains:[{className:"literal",match:"(true|false|null|undefined)"},{
className:"string",variants:[{begin:'"',end:'"'},{begin:"\\'",end:"\\'"},{
begin:"\\\\\\\\",end:"$"}],contains:[{className:"string",variants:[{
match:"\\\\([nrt'\"\\\\]|(x[0-9a-fA-F]{2})|(u\\{[0-9a-fA-F]+\\}))"},{
match:"\\\\."}],relevance:0}],relevance:0},{className:"comment",variants:[{
begin:"//[!/](?=[^/])",end:"$"},{begin:"//",end:"$"}],relevance:0,contains:[{
className:"title",match:"\\b(TODO|FIXME|XXX|NOTE)\\b:?",relevance:0}]},{
className:"type",variants:[{
match:"\\b(f16|f32|f64|f128|u\\d+|i\\d+|isize|usize|comptime_int|comptime_float)\\b",
relevance:2},{
match:"\\b(c_short|c_ushort|c_int|c_uint|c_long|c_ulong|c_longlong|c_ulonglong|c_longdouble|c_void)\\b",
relevance:1},{match:"\\b(bool|void|noreturn|type|anyerror|anyframe|anytype)\\b",
relevance:0}]},{className:"function",variants:[{beginKeywords:"fn",
end:"([_a-zA-Z][_a-zA-Z0-9]*)",excludeBegin:!0}],relevance:0},{
className:"built_in",match:"@[_a-zA-Z][_a-zA-Z0-9]*"},{begin:"@import\\(",
relevance:10},{className:"operator",variants:[{match:"\\[*c\\]"},{
match:"(==|!=)"},{match:"(-%?|\\+%?|\\*%?|/|%)=?"},{
match:"(<<%?|>>|!|&|\\^|\\|)=?"},{match:"(==|\\+\\+|\\*\\*|->)"}],relevance:0},{
className:"numbers",variants:[{
match:"\\b[0-9][0-9_]*(\\.[0-9][0-9_]*)?([eE][+-]?[0-9_]+)?\\b"},{
match:"\\b[0-9][0-9_]*\\b"},{match:"\\b0x[a-fA-F0-9_]+\\b"},{
match:"\\b0o[0-7_]+\\b"},{match:"\\b0b[01_]+\\b"}],relevance:0}]})
