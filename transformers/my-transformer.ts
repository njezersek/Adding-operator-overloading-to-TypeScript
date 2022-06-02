import ts, { CompilerHost, CompilerOptions, Program, SyntaxKind, TransformationContext, SourceFile, Node, Expression, Identifier, visitEachChild } from 'typescript';
import { PluginConfig, ProgramTransformerExtras } from "ts-patch";
import path from 'path';
import {} from 'ts-expose-internals'


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

/**
 * Patches existing Compiler Host (or creates new one) to allow feeding updated file content from cache
 */
function getPatchedHost(
  maybeHost: CompilerHost | undefined,
  tsInstance: typeof ts,
  compilerOptions: CompilerOptions
): CompilerHost & { fileCache: Map<string, SourceFile> }
{
  const fileCache = new Map();
  const compilerHost = maybeHost ?? tsInstance.createCompilerHost(compilerOptions, true);
  const originalGetSourceFile = compilerHost.getSourceFile;

  return Object.assign(compilerHost, {
	getSourceFile(fileName: string, languageVersion: ts.ScriptTarget) {
	  fileName = tsInstance.normalizePath(fileName);
	  if (fileCache.has(fileName)) return fileCache.get(fileName);

	  const sourceFile = originalGetSourceFile.apply(void 0, Array.from(arguments) as any);
	  fileCache.set(fileName, sourceFile);

	  return sourceFile;
	},
	fileCache
  });
}

// endregion


/* ****************************************************************************************************************** */
// region: Program Transformer
/* ****************************************************************************************************************** */

export default function transformProgram(
  program: Program,
  host: CompilerHost | undefined,
  config: PluginConfig,
  { ts: tsInstance }: ProgramTransformerExtras,
): Program {
  const compilerOptions = program.getCompilerOptions();
  const compilerHost = getPatchedHost(host, tsInstance, compilerOptions);
  const rootFileNames = program.getRootFileNames().map(tsInstance.normalizePath);
  /* Transform AST */
  const transformedSource = tsInstance.transform(
	/* sourceFiles */ program.getSourceFiles().filter(sourceFile => rootFileNames.includes(sourceFile.fileName)),
	/* transformers */ [ createTransformAst(program).bind(tsInstance) ],
	compilerOptions
  ).transformed;

  /* Render modified files and create new SourceFiles for them to use in host's cache */
  const { printFile } = tsInstance.createPrinter();
  for (const sourceFile of transformedSource) {
	const { fileName, languageVersion } = sourceFile;
	const updatedSourceFile = tsInstance.createSourceFile(fileName, printFile(sourceFile), languageVersion);
	compilerHost.fileCache.set(fileName, updatedSourceFile);
  }

  /* Re-create Program instance */
  return tsInstance.createProgram(rootFileNames, compilerOptions, compilerHost);
}

// endregion


/* ****************************************************************************************************************** */
// region: AST Transformer
/* ****************************************************************************************************************** */

/**
 * Change all 'number' keywords to 'string'
 *
 * @example
 * // before
 * type A = number
 *
 * // after
 * type A = string
 */
function createTransformAst(program: Program){
	return function transformAst(this: typeof ts, context: TransformationContext) {
		const tsInstance = this;

		/* Transformer Function */
		return (sourceFile: SourceFile) => {
			return tsInstance.visitEachChild(sourceFile, visit, context);

			/* Visitor Function */
			function visit(node: Node): Node {
				if(node.kind === SyntaxKind.BinaryExpression) {
					let n = node as ts.BinaryExpression;
					const { left, right } = n;
					let leftType = program.getTypeChecker().getTypeAtLocation(left);
					let rightType = program.getTypeChecker().getTypeAtLocation(right);

					// is left a number?
					if(leftType.flags & ts.TypeFlags.Number) {
						return tsInstance.visitEachChild(node, visit, context);
					}
					// is left a string?
					if(leftType.flags & ts.TypeFlags.String) {
						return tsInstance.visitEachChild(node, visit, context);
					}
					
					

					const kind = n.operatorToken.kind;
					let operatorFunctionIdentifier;
					switch(kind) {
						case SyntaxKind.EqualsToken:
							operatorFunctionIdentifier = "__eq__";
							break;
						case SyntaxKind.PlusToken:
							operatorFunctionIdentifier = "__add__";
							break;
						case SyntaxKind.MinusToken:
							operatorFunctionIdentifier = "__sub__";
							break;
						case SyntaxKind.AsteriskToken:
							operatorFunctionIdentifier = "__mul__";
							break;
						case SyntaxKind.SlashToken:
							operatorFunctionIdentifier = "__div__";
							break;
						case SyntaxKind.PercentToken:
							operatorFunctionIdentifier = "__mod__";
							break;
					}

					if(operatorFunctionIdentifier) {
						// transform left and ritht, than create new CallExpression
						const newLeft = tsInstance.visitNode(left, visit) as Expression;
						const newRight = tsInstance.visitNode(right, visit) as Expression;
						return context.factory.createMethodCall(
							context.factory.createIdentifier(leftType.getSymbol().getName()),
							operatorFunctionIdentifier,
							[newLeft, newRight]
						)
						// return context.factory.createCallExpression(
						// 	context.factory.createIdentifier(operatorFunctionIdentifier),
						// 	[],
						// 	[newLeft, newRight]
						// )
					}
				}
				return tsInstance.visitEachChild(node, visit, context);
			}
		}
	}
}

// endregion