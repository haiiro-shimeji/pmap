module pmap {

    export class Application {

        static DEFAULT_PRIORITY: number = 100;

        static private instance: pmap.Application;

        private viewClasses;    ///< Array of pmap.View
        private viewInstances;
        private config;

        constructor() {
            this.viewClasses = {};
            this.viewInstances = {};
            this.config = {};
        }

        static getInstance(): pmap.Application {
            if (!pmap.Application.instance) {
                pmap.Application.instance = new pmap.Application();
            }
            return pmap.Application.instance;
        }

        addView(view: any, priority: number, tag: string): void {

            priority = priority || pmap.Application.DEFAULT_PRIORITY;

            if (!this.viewClasses[priority]) {
                this.viewClasses[priority] = [];
            }

            this.viewClasses[priority].push({
                tag: tag,
                view: view
            });

        }

        init(): void {

            var self = this;

            var defer = $.Deferred();
            var piped = defer;

            var priorities = $.map(this.viewClasses, (value, key) => { return key });

            priorities.sort();

            $.each( priorities, function(i, priority) {
                var viewClassesInPriority = self.viewClasses[ priority ];
                $.each( viewClassesInPriority, function(i, obj) {
                    piped = piped.pipe(function() {
                        var instance = new (obj.view)({ app: self });
                        instance.render()
                        if ( obj.tag ) {
                            self.viewInstances[ obj.tag ] = instance;
                        }
                        return instance.defer || $.Deferred().resolve();
                    })
                })
            })

            defer.resolve();

        }

        findView(tag : string) {
            return this.viewInstances[ tag ];
        }

    }

}
