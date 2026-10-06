// Cabecera de sección: antetítulo dorado, título en serif y filete fino.
export default function SectionTitle({ antetitulo, titulo }) {
  return (
    <div className="flex flex-col items-center text-center">
      {antetitulo && (
        <span className="text-[11px] tracking-luxe text-champagne uppercase">{antetitulo}</span>
      )}
      <h2 className="mt-3 font-serif text-3xl text-carbon sm:text-4xl">{titulo}</h2>
      <span className="mt-4 h-px w-24 bg-champagne/50" />
    </div>
  );
}
