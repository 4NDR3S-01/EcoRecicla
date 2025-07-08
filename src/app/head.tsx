export default function Head() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              const mode = localStorage.getItem('eco-dark-mode');
              if (mode === 'true' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e){}
          `,
        }}
      />
    </>
  );
} 