type ConditionalClassName = [boolean | undefined, string]
export const conditionalClassNames = (options: Array<ConditionalClassName>) => options.filter(o => o[0]).map(o => o[1]).join(' ')