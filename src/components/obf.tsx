export function Obfuscate({ text }: { text: string }) {
  return (
    <span>
      {text.split("").map((char, index) => (
        <span key={index}>{char}</span>
      ))}
    </span>
  );
}
