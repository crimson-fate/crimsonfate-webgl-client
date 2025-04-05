import { useEffect, useRef } from 'react';
import { gsap, Back } from 'gsap';
import './BoltLoader.css';

export default function BoltLoader() {
  const boltRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const bolt = boltRef.current;
    const div = divRef.current;
    
    if (!bolt || !div) return;

    const animate = () => {
      bolt.classList.add('animate');
      
      tweenRef.current = gsap.timeline({
        onComplete: () => {
          bolt.classList.remove('animate');
          repeat();
        }
      })
        .set(div, {
          rotation: 360
        })
        .to(div, {
          duration: 0.7,
          y: 80,
          rotation: 370
        })
        .to(div, {
          duration: 0.6,
          y: -140,
          rotation: 20
        })
        .to(div, {
          duration: 0.1,
          rotation: -24,
          y: 80
        })
        .to(div, {
          duration: 0.8,
          ease: Back.easeOut.config(1.6),
          rotation: 0,
          y: 0
        });
    };

    const repeat = () => {
      setTimeout(() => {
        bolt.classList.add('animate');
        tweenRef.current!.restart();
      }, 400);
    };

    animate();

    // Cleanup
    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
    };
  }, []);

  return (
    <div className="bolt" ref={boltRef}>
      <svg viewBox="0 0 170 57" className="white left">
        <path d="M36.2701759,17.9733192 C-0.981139498,45.4810755 -7.86361824,57.6618438 15.6227397,54.5156241 C50.8522766,49.7962945 201.109341,31.1461782 161.361488,2"></path>
      </svg>
      <svg viewBox="0 0 170 57" className="white right">
        <path d="M36.2701759,17.9733192 C-0.981139498,45.4810755 -7.86361824,57.6618438 15.6227397,54.5156241 C50.8522766,49.7962945 201.109341,31.1461782 161.361488,2"></path>
      </svg>
      <div ref={divRef}>
        <span></span>
      </div>
      <svg viewBox="0 0 112 44" className="circle">
        <path d="M96.9355003,2 C109.46067,13.4022454 131.614152,42 56.9906735,42 C-17.6328048,42 1.51790702,13.5493875 13.0513641,2"></path>
      </svg>
      <svg viewBox="0 0 70 3" className="line left">
        <path
          transform="translate(-2.000000, 0.000000)"
          d="M2,1.5 L70,1.5"
        ></path>
      </svg>
      <svg viewBox="0 0 70 3" className="line right">
        <path
          transform="translate(-2.000000, 0.000000)"
          d="M2,1.5 L70,1.5"
        ></path>
      </svg>
    </div>
  );
}
