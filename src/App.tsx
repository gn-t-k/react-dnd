import { FC } from 'react';
import { useDnDSort } from './useDnDSort';

type Style<T extends HTMLElement> = React.HTMLAttributes<T>['style'];

const bodyStyle: Style<HTMLDivElement> = {
  height: '100vh',
  display: 'flex',
  overflow: 'hidden',
  alignItems: 'center',
  justifyContent: 'center',
};

const containerStyle: Style<HTMLDivElement> = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  width: '100%',
  maxWidth: '350px',
  maxHeight: '500px',
};

const imageCardStyle: Style<HTMLDivElement> = {
  cursor: 'grab',
  userSelect: 'none',
  width: '100px',
  height: '130px',
  overflow: 'hidden',
  borderRadius: '5px',
  margin: 3,
};

const imageStyle: Style<HTMLImageElement> = {
  pointerEvents: 'none',
  objectFit: 'cover',
  width: '100%',
  height: '100%',
};

const imageList: string[] = [
  'https://images.pexels.com/photos/2441454/pexels-photo-2441454.jpeg',
  'https://images.pexels.com/photos/2693529/pexels-photo-2693529.jpeg',
  'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg',
  'https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg',
  'https://images.pexels.com/photos/3283186/pexels-photo-3283186.jpeg',
  'https://images.pexels.com/photos/1910225/pexels-photo-1910225.jpeg',
];

const App: FC = () => {
  const results = useDnDSort(imageList);

  return (
    <div style={bodyStyle}>
      <div style={containerStyle}>
        {results.map((item) => (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            key={item.key}
            style={imageCardStyle}
            ref={item.events.ref}
            onMouseDown={item.events.onMouseDown}
          >
            <img src={item.value} alt="ソート可能な画像" style={imageStyle} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
