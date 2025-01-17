const resolvableExtensions = () => [`.ts`, `.tsx`]

function onCreateBabelConfig({ actions }, options) {
  actions.setBabelPreset({
    name: require.resolve(`@babel/preset-typescript`),
    options,
  })
  actions.setBabelPlugin({
    name: require.resolve(`@babel/plugin-proposal-optional-chaining`),
  })
  actions.setBabelPlugin({
    name: require.resolve(`@babel/plugin-proposal-nullish-coalescing-operator`),
  })
  actions.setBabelPlugin({
    name: require.resolve(`@babel/plugin-proposal-numeric-separator`),
  })
}

function onCreateWebpackConfig({ actions, loaders }) {
  if (typeof loaders?.js !== `function`) {
    return
  }

  let doesUsedGatsbyVersionSupportResourceQuery
  try {
    const { version } = require(`gatsby/package.json`)
    const [major, minor] = version.split(`.`).map(Number)
    doesUsedGatsbyVersionSupportResourceQuery =
      (major === 4 && minor >= 19) || major > 4
  } catch {
    doesUsedGatsbyVersionSupportResourceQuery = true
  }

  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: ({ resourceQuery, issuer }) => [
            loaders.js(
              doesUsedGatsbyVersionSupportResourceQuery
                ? {
                    isPageTemplate: /async-requires/.test(issuer),
                    resourceQuery,
                  }
                : undefined
            ),
          ],
        },
      ],
    },
  })
}

exports.pluginOptionsSchema = ({ Joi }) =>
  Joi.object({
    isTSX: Joi.boolean().description(`Enables jsx parsing.`).default(false),
    jsxPragma: Joi.string()
      .description(`Replace the function used when compiling JSX expressions.`)
      .default(`React`),
    jsxPragmaFrag: Joi.string()
      .description(
        `Replace the function used when compiling JSX fragment expressions.`
      )
      .optional(),
    allExtensions: Joi.boolean()
      .description(`Indicates that every file should be parsed as TS or TSX.`)
      .default(false)
      .when(`isTSX`, { is: true, then: Joi.valid(true) }),
    allowNamespaces: Joi.boolean()
      .description(`Enables compilation of TypeScript namespaces.`)
      .optional(),
    allowDeclareFields: Joi.boolean()
      .description(
        `When enabled, type-only class fields are only removed if they are prefixed with the declare modifier.`
      )
      .optional(),
    onlyRemoveTypeImports: Joi.boolean()
      .description(
        `When set to true, the transform will only remove type-only imports (introduced in TypeScript 3.8).` +
          `This should only be used if you are using TypeScript >= 3.8.`
      )
      .optional(),
  })

exports.resolvableExtensions = resolvableExtensions
exports.onCreateBabelConfig = onCreateBabelConfig
exports.onCreateWebpackConfig = onCreateWebpackConfig
