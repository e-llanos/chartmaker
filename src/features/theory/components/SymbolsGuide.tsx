import type { ReactNode } from 'react';
import type { MeasureMark } from '@/domain/score/types';
import BarIcon, { type BarIconKind } from '@/shared/notation/BarIcon';
import { MarkView, SimileIcon } from '@/shared/notation/ScoreSymbols';

interface SymbolItem {
    demo: ReactNode;
    name: string;
    text: string;
}

interface SymbolGroup {
    title: string;
    items: SymbolItem[];
}

const bar = (kind: BarIconKind) => <BarIcon kind={kind} />;
const mark = (m: MeasureMark) => <MarkView mark={m} />;

const GROUPS: SymbolGroup[] = [
    {
        title: 'Compás y tiempos',
        items: [
            { demo: '4/4', name: 'Indicación de compás', text: 'El número de arriba dice cuántos tiempos tiene cada compás y el de abajo qué figura vale un tiempo. En 4/4 hay cuatro tiempos por compás.' },
            { demo: 'A / / /', name: 'Marca de tiempos', text: 'Cada compás muestra todos sus tiempos. Un acorde en el primer tiempo seguido de barras significa que se mantiene todo el compás.' },
            { demo: 'N.C.', name: 'Sin acorde (No Chord)', text: 'Se deja de tocar el acorde: silencio armónico.' },
        ],
    },
    {
        title: 'Barras de compás',
        items: [
            { demo: bar('single'), name: 'Barra simple', text: 'Separa un compás de otro.' },
            { demo: bar('double'), name: 'Barra doble', text: 'Marca un cambio de sección, por ejemplo de verso a coro.' },
            { demo: bar('repeat-start'), name: 'Inicio de repetición', text: 'Desde aquí se vuelve a tocar al llegar a la barra de fin de repetición.' },
            { demo: bar('repeat-end'), name: 'Fin de repetición', text: 'Se regresa al inicio de repetición y se toca de nuevo. Si no hay inicio previo, se vuelve al principio de la pieza.' },
            { demo: bar('final'), name: 'Barra final', text: 'Indica el final de la pieza.' },
        ],
    },
    {
        title: 'Repeticiones',
        items: [
            { demo: '×2', name: 'Repetir la sección', text: 'El número indica cuántas veces se toca la sección completa.' },
            { demo: <SimileIcon />, name: 'Repetir el compás anterior', text: 'Se toca de nuevo lo mismo que en el compás anterior.' },
            { demo: <><span className="volta-demo">1.</span><span className="volta-demo">2.</span></>, name: 'Casillas', text: 'La primera vez se toca la casilla 1. Al repetir, se salta la 1 y se toca la casilla 2.' },
        ],
    },
    {
        title: 'Saltos y navegación',
        items: [
            { demo: mark('segno'), name: 'Segno', text: 'Marca un punto al que se vuelve con D.S.' },
            { demo: mark('coda'), name: 'Coda', text: 'Sección final a la que se llega con «To Coda».' },
            { demo: mark('toCoda'), name: 'To Coda', text: 'Aquí se salta a la coda (cuando se indica con D.C. o D.S. al Coda).' },
            { demo: mark('dc'), name: 'Da Capo (D.C.)', text: 'Volver al principio de la pieza.' },
            { demo: mark('ds'), name: 'Dal Segno (D.S.)', text: 'Volver al segno.' },
            { demo: mark('dcCoda'), name: 'D.C. al Coda', text: 'Volver al principio y, al llegar a «To Coda», saltar a la coda.' },
            { demo: mark('dsCoda'), name: 'D.S. al Coda', text: 'Volver al segno y, al llegar a «To Coda», saltar a la coda.' },
            { demo: mark('fine'), name: 'Fine', text: 'Final de la pieza tras un D.C. o un D.S.' },
            { demo: mark('fermata'), name: 'Calderón', text: 'Se mantiene el acorde más tiempo del escrito.' },
        ],
    },
    {
        title: 'Cifrado de acordes',
        items: [
            { demo: 'C', name: 'Mayor', text: 'Tríada mayor: 1 3 5.' },
            { demo: 'Cm', name: 'Menor', text: 'Tríada menor: 1 b3 5.' },
            { demo: 'C7', name: 'Dominante', text: 'Tríada mayor con séptima menor.' },
            { demo: 'Cmaj7', name: 'Séptima mayor', text: 'Tríada mayor con séptima mayor.' },
            { demo: 'Csus4', name: 'Suspendido', text: 'Cambia la tercera por la cuarta (sus4) o por la segunda (sus2).' },
            { demo: 'Cadd9', name: 'Novena añadida', text: 'Tríada mayor con la novena, sin séptima.' },
            { demo: 'Cdim · C°', name: 'Disminuido', text: 'Tríada con tercera y quinta menores.' },
            { demo: 'Caug · C+', name: 'Aumentado', text: 'Tríada con quinta aumentada.' },
            { demo: 'Cm7b5 · Cø', name: 'Semidisminuido', text: 'Disminuido con séptima menor.' },
            { demo: 'C/E', name: 'Bajo alterno', text: 'Se toca el acorde de Do con Mi en el bajo (una inversión).' },
        ],
    },
    {
        title: 'Formas de nombrar los acordes',
        items: [
            { demo: 'C D E', name: 'Notación americana', text: 'Las notas se nombran con letras: C = Do, D = Re, E = Mi, F = Fa, G = Sol, A = La, B = Si.' },
            { demo: 'Do Re Mi', name: 'Notación latina', text: 'Las notas se nombran con sílabas. La app permite verlas en cualquiera de las dos.' },
            { demo: 'I IV V', name: 'Números romanos', text: 'Indican el grado dentro de la tonalidad: mayúsculas para acordes mayores y minúsculas para menores.' },
            { demo: '1 4 5', name: 'Sistema Nashville', text: 'Igual que los romanos, pero con números: sirve para tocar una canción en cualquier tono.' },
        ],
    },
];

export default function SymbolsGuide() {
    return (
        <div className="th-panel">
            {GROUPS.map((g) => (
                <section key={g.title} className="th-card">
                    <h3>{g.title}</h3>
                    <div className="sym-list">
                        {g.items.map((item) => (
                            <div key={item.name} className="sym-row">
                                <div className="sym-demo">{item.demo}</div>
                                <strong>{item.name}</strong>
                                <p className="th-muted">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}