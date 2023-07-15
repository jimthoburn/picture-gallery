/*
The MIT License (MIT)

Copyright (c) 2015 David Khourshid

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// 1) Copied from: https://github.com/davidkpiano/xstate/blob/main/packages/xstate-react/src/index.ts
//                 https://github.com/davidkpiano/xstate/blob/8cc6b1c6aa719cbae77ea5687dd8475951e1ce91/packages/xstate-react/src/index.ts
// 2) Converted to JS by https://www.typescriptlang.org/play/?target=6

// 3) Switch from React to Preact
// BEFORE:
// import { useState, useRef, useEffect } from 'react';
// AFTER:
import { useState, useRef, useEffect } from "preact/hooks";

import { interpret } from "xstate";

let lastDispatch;
export const getLastDispatch = function() {
  return lastDispatch;
}

const defaultOptions = {
    immediate: false
};
export function useMachine(machine, options = defaultOptions) {
    const { context, guards, actions, activities, services, delays, immediate, ...interpreterOptions } = options;
    const machineConfig = {
        context,
        guards,
        actions,
        activities,
        services,
        delays
    };
    // Reference the machine
    const machineRef = useRef(null);
    // Create the machine only once
    // See https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
    if (machineRef.current === null) {
        machineRef.current = machine.withConfig(machineConfig, {
            ...machine.context,
            ...context
        });
    }
    // Reference the service
    const serviceRef = useRef(null);
    // Create the service only once
    if (serviceRef.current === null) {
        serviceRef.current = interpret(machineRef.current, interpreterOptions).onTransition(state => {
            // Update the current machine state when a transition occurs
            if (state.changed) {
                setCurrent(state);
            }
        });
    }
    const service = serviceRef.current;
    // Make sure actions are kept updated when they change.
    // This mutation assignment is safe because the service instance is only used
    // in one place -- this hook's caller.
    useEffect(() => {
        Object.assign(service.machine.options.actions, actions);
    }, [actions]);
    // Start service immediately (before mount) if specified in options
    if (immediate) {
        service.start();
    }
    // Keep track of the current machine state
    const [current, setCurrent] = useState(() => service.initialState);
    useEffect(() => {
        // Start the service when the component mounts.
        // Note: the service will start only if it hasn't started already.
        service.start();
        return () => {
            // Stop the service when the component unmounts
            service.stop();
        };
    }, []);
    return [current, function() {
      console.log("📮 Dispatch");
      lastDispatch = arguments[0];
      console.log(lastDispatch);
      service.start();
      service.send.apply(service.send, arguments);
    }, service];
}
export function useService(service) {
    const [current, setCurrent] = useState(service.state);
    useEffect(() => {
        // Set to current service state as there is a possibility
        // of a transition occurring between the initial useState()
        // initialization and useEffect() commit.
        setCurrent(service.state);
        const listener = state => {
            if (state.changed) {
                setCurrent(state);
            }
        };
        const sub = service.subscribe(listener);
        return () => {
            sub.unsubscribe();
        };
    }, [service]);
    return [current, service.send, service];
}
export function useActor(actor) {
    const [current, setCurrent] = useState(undefined);
    const actorRef = useRef(actor);
    useEffect(() => {
        if (actor) {
            actorRef.current = actor;
            const sub = actor.subscribe(setCurrent);
            return () => {
                sub.unsubscribe();
            };
        }
    }, [actor]);
    return [current, actorRef.current ? actorRef.current.send : () => void 0];
}
