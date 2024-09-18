import { useEffect, useRef, useState } from 'react';
import { MMLClient } from './mml-client.component';
import { EditableNetworkedDOM, IframeObservableDOMFactory } from 'mml-web-runner';

function createDocumentCode(code: string): string {
  return `<m-group z="1" rx="10" y="-1">${code}</m-group>`;
}

export default function MML({ name, model, badges }: { name: string, model: string; badges: string[]; }) {
  const [networkedDOMDocument, setNetworkedDOMDocument] = useState<EditableNetworkedDOM | null>(null);
  const documentRef = useRef<EditableNetworkedDOM | null>(null);

  useEffect(() => {
    const document = new EditableNetworkedDOM('http://example.com/index.html', IframeObservableDOMFactory, true);
    document.load(
      createDocumentCode(
        `<m-model src="${model}" sx="4.75" sy="4.75" sz="4.25"></m-model>` +
        `<m-label
            id="label"
            color="#333"
            font-color="white"
            content="${name}"
            font-size="30"
            alignment="center"
            y="2"
            z="1.5"
            width="5"
            height="0.5"
            rx="-30"
        ></m-label>
        <m-group id="badges" z="3" x="-2.75" y="${9 - badges.length}">
        ${badges?.map((badge, i) => `
        <m-group y="${i * 1.1}" ry="30"><m-cylinder
            color="#222222"
            height="0.05"
            rz="90"
            ry="90"
            radius="0.5"
        >
        </m-cylinder>
        <m-image
          opacity="100"
          id="badge-${i}"
          src="${badge}"
          z="0.035"
          width="0.95"
          height="0.95"
        ></m-image></m-group>`)?.join('') || ''}
        </m-group><script>
          let r = 0;
          setInterval(function () {
            const badges = document.getElementById("badges");
            badges.setAttribute("ry", (Math.sin(r) * (Math.PI / 9)) * 100);
            r += 0.075;
          }, 100);

          const label = document.getElementById("label");
          const badge = document.getElementById("badge-"+${badges.length - 1});
          badge.addEventListener("click", (e) => {
            label.setAttribute(
              "content", 
              "Clicked: " + badge.getAttribute("src").replace('https://cdn.other.page/badge/','')
            );
          });
        </script>`,
      ),
    );
    setNetworkedDOMDocument(document);

    return () => {
      document.dispose();
      if (documentRef.current) {
        documentRef.current.dispose();
      }
    };
  }, [model, badges]);

  if (!networkedDOMDocument) return <></>;

  return <MMLClient clientId={0} key={model} document={networkedDOMDocument} />;
}