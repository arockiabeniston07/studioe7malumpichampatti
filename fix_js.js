const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

let code = fs.readFileSync('main.js', 'utf8');

// First pass: remove .hero-scroll-hint occurrences completely in array/object
code = code.replace(/,\s*'\.hero-scroll-hint'/g, '');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

traverse(ast, {
  // 1. Remove GSAP animations for .hero-scroll-hint or guard them
  // 2. Guard all gsap.to/from/fromTo and tl.to/from/fromTo and ScrollTrigger.create
  CallExpression(path) {
    const callee = path.node.callee;
    
    // Check if it's e.target.closest()
    if (
      t.isMemberExpression(callee) &&
      t.isIdentifier(callee.property, { name: 'closest' }) &&
      t.isMemberExpression(callee.object) &&
      t.isIdentifier(callee.object.property, { name: 'target' })
    ) {
      // Find the closest parent statement to insert the if condition
      const statementParent = path.getStatementParent();
      if (statementParent && !statementParent.node._closestGuarded) {
        statementParent.node._closestGuarded = true;
        // if (!(e.target instanceof Element)) return;
        const guard = t.ifStatement(
          t.unaryExpression(
            '!',
            t.binaryExpression(
              'instanceof',
              callee.object,
              t.identifier('Element')
            )
          ),
          t.returnStatement()
        );
        statementParent.insertBefore(guard);
      }
    }

    // Check if it's gsap or tl animation functions
    let isGsapAnimation = false;
    let isScrollTrigger = false;
    let targetArgIndex = 0;

    if (t.isMemberExpression(callee)) {
      const objName = callee.object.name;
      const propName = callee.property.name;
      
      if ((objName === 'gsap' || objName === 'tl' || objName === 'timeline') && 
          ['to', 'from', 'fromTo', 'set'].includes(propName)) {
        isGsapAnimation = true;
        targetArgIndex = 0;
      } else if (objName === 'ScrollTrigger' && propName === 'create') {
        isScrollTrigger = true;
      }
    }

    if (isGsapAnimation) {
      const targetArg = path.node.arguments[0];
      if (t.isStringLiteral(targetArg)) {
        const selector = targetArg.value;
        if (selector === '.hero-scroll-hint') {
          // Remove it entirely
          path.remove();
          return;
        }

        // We only want to guard it if it's a standalone statement (ExpressionStatement)
        // If it's part of a variable declaration or assignment, guarding it with 'if' is complex.
        const parentNode = path.parent;
        if (t.isExpressionStatement(parentNode) && !parentNode._gsapGuarded) {
          parentNode._gsapGuarded = true;
          // Create block: 
          // const target = document.querySelector('selector');
          // if (target) { gsap.to(target, ...); }
          
          const uid = path.scope.generateUidIdentifier("target");
          
          const queryCall = t.callExpression(
            t.memberExpression(t.identifier('document'), t.identifier('querySelector')),
            [t.stringLiteral(selector)]
          );
          
          const varDecl = t.variableDeclaration('const', [
            t.variableDeclarator(uid, queryCall)
          ]);

          // Replace the argument with the new target variable
          path.node.arguments[0] = uid;

          const ifStmt = t.ifStatement(
            uid,
            t.blockStatement([parentNode])
          );

          path.parentPath.replaceWithMultiple([varDecl, ifStmt]);
        }
      }
    }

    // Guard ScrollTrigger.create({ trigger: '.selector' })
    if (isScrollTrigger) {
      const configArg = path.node.arguments[0];
      if (t.isObjectExpression(configArg)) {
        const triggerProp = configArg.properties.find(p => p.key && p.key.name === 'trigger');
        if (triggerProp && t.isStringLiteral(triggerProp.value)) {
          const selector = triggerProp.value.value;
          
          const parentNode = path.parent;
          if (t.isExpressionStatement(parentNode) && !parentNode._gsapGuarded) {
            parentNode._gsapGuarded = true;
            const uid = path.scope.generateUidIdentifier("target");
            
            const queryCall = t.callExpression(
              t.memberExpression(t.identifier('document'), t.identifier('querySelector')),
              [t.stringLiteral(selector)]
            );
            
            const varDecl = t.variableDeclaration('const', [
              t.variableDeclarator(uid, queryCall)
            ]);
  
            triggerProp.value = uid;
  
            const ifStmt = t.ifStatement(
              uid,
              t.blockStatement([parentNode])
            );
  
            path.parentPath.replaceWithMultiple([varDecl, ifStmt]);
          }
        }
      }
    }
    
    // Add defensive checks for querySelector, closest, matches, classList on potentially null elements
    // We look for MemberExpressions like obj.querySelector, obj.classList, etc. where obj is not document or window
    if (t.isMemberExpression(callee)) {
      const propName = callee.property.name;
      if (['querySelector', 'querySelectorAll', 'closest', 'matches'].includes(propName)) {
        const obj = callee.object;
        if (!t.isIdentifier(obj) || (obj.name !== 'document' && obj.name !== 'window' && obj.name !== 'e')) {
           // Maybe it's `container.querySelector`. We should ensure container is valid before calling.
           // This is harder to statically wrap securely without knowing if it's null, but we can do optional chaining
           // Actually, the user asked to "Add defensive checks for: querySelector... Never execute code on null elements."
           // The simplest way to add defensive checks is optional chaining (`?.`), but `generate` supports it.
           path.node.callee = t.optionalMemberExpression(
             callee.object,
             callee.property,
             callee.computed,
             true // optional
           );
        }
      }
    }
  },
  
  MemberExpression(path) {
    // Also protect `.classList` access
    const propName = path.node.property.name;
    if (propName === 'classList' && !path.node.optional) {
        // use optional chaining
        path.replaceWith(t.optionalMemberExpression(
             path.node.object,
             path.node.property,
             path.node.computed,
             true // optional
        ));
    }
  }
});

const output = generate(ast, {}, code);
fs.writeFileSync('main.js', output.code);
