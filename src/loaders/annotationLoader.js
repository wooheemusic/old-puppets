export default function(source) {
  // (예정) 성능을 위해 regex를 string을 다루는 쪽으로 변경
  return source.replace(/\n@(\w|\(|\))+\s*\n/g, "\n");
}
