import * as React from 'react';
import { useEffect } from 'react';
// import root from 'react-shadow';

// Use an element that will be loaded/rendered when the Shadow DOM is loaded to trigger the onLoad event.
function OnLoadEl({ onLoad }: { onLoad: () => void }) {
  useEffect(() => {
    onLoad();
  }, [onLoad]);
  return <></>;
}

export default function MMLView(props: {
  children?: React.ReactNode;
  elementRef: React.Ref<HTMLDivElement>;
  onLoad: () => void;
}) {
  const { children, elementRef } = props;

  return (
    <div className="relative size-full">
      {/* <root.div className="relative size-full min-h-0 min-w-0"> */}
      <div
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
        }}
        ref={elementRef}
      ></div>
      <OnLoadEl onLoad={props.onLoad} />
      {/* </root.div> */}
      {children}
    </div>
  );
}