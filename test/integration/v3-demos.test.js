'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /v3/demo', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid component and demo are requested', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('<!DOCTYPE html>\n' +
			'<html lang="en" class="">\n' +
			'<head>\n' +
			'\t<meta charset="utf-8" />\n' +
			'\t<meta http-equiv="X-UA-Compatible" content="IE=Edge" />\n' +
			'\t<title>o-test-component: test-demo demo</title>\n' +
			'\t<meta name="viewport" content="initial-scale=1.0, width=device-width" />\n' +
			'\t<style>\n' +
			'\t\tbody {\n' +
			'\t\t\tmargin: 0;\n' +
			'\t\t}\n' +
			'\t</style>\n' +
			'\n' +
			'\t\t<script src="https://polyfill.io/v3/polyfill.min.js?features=CustomEvent&flags=gated&unknown=polyfill"></script>\n' +
			'\n' +
			'\n' +
			'\n' +
			'\n' +
			`\t\t<style>.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:'Hello world!  The square root of 64 is "8".'}\n` +
			'</style>\n' +
			'</head>\n' +
			'<body>\n' +
			'\t<div data-o-component="o-test-component" class="o-test-component">\n' +
			'\t</div>\n' +
			'\t<script src="https://registry.origami.ft.com/embedapi?autoload=resize"></script>\n' +
			'\t\t<script>(function(){"use strict";function _(R){return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?_=function(y){return typeof y}:_=function(y){return y&&typeof Symbol=="function"&&y.constructor===Symbol&&y!==Symbol.prototype?"symbol":typeof y},_(R)}(function(){var R=(typeof global=="undefined"?"undefined":_(global))=="object"&&global&&global.Object===Object&&global,T=R,y=(typeof self=="undefined"?"undefined":_(self))=="object"&&self&&self.Object===Object&&self,Rt=T||y||Function("return this")(),w=Rt,Tt=w.Symbol,$=Tt,Q=Object.prototype,kt=Q.hasOwnProperty,Ct=Q.toString,O=$?$.toStringTag:void 0;function It(t){var n=kt.call(t,O),r=t[O];try{t[O]=void 0;var e=!0}catch(a){}var o=Ct.call(t);return e&&(n?t[O]=r:delete t[O]),o}var Wt=It,Dt=Object.prototype,Gt=Dt.toString;function Kt(t){return Gt.call(t)}var Nt=Kt,Ut="[object Null]",qt="[object Undefined]",V=$?$.toStringTag:void 0;function zt(t){return t==null?t===void 0?qt:Ut:V&&V in Object(t)?Wt(t):Nt(t)}var X=zt;function Bt(t){return t!=null&&_(t)=="object"}var Y=Bt,Ht="[object Symbol]";function Jt(t){return _(t)=="symbol"||Y(t)&&X(t)==Ht}var Lt=Jt,Qt=Array.isArray,Vt=Qt,Xt=/\\s/;function Yt(t){for(var n=t.length;n--&&Xt.test(t.charAt(n)););return n}var Zt=Yt,tn=/^\\s+/;function nn(t){return t&&t.slice(0,Zt(t)+1).replace(tn,"")}var rn=nn;function en(t){var n=_(t);return t!=null&&(n=="object"||n=="function")}var m=en,Z=0/0,on=/^[-+]0x[0-9a-f]+$/i,an=/^0b[01]+$/i,un=/^0o[0-7]+$/i,cn=parseInt;function vn(t){if(typeof t=="number")return t;if(Lt(t))return Z;if(m(t)){var n=typeof t.valueOf=="function"?t.valueOf():t;t=m(n)?n+"":n}if(typeof t!="string")return t===0?t:+t;t=rn(t);var r=an.test(t);return r||un.test(t)?cn(t.slice(2),r?2:8):on.test(t)?Z:+t}var fn=vn,tt=1/0,ln=17976931348623157e292;function pn(t){if(!t)return t===0?t:0;if(t=fn(t),t===tt||t===-tt){var n=t<0?-1:1;return n*ln}return t===t?t:0}var sn=pn;function hn(t){var n=sn(t),r=n%1;return n===n?r?n-r:n:0}var nt=hn;function _n(t){return t}var k=_n,yn="[object AsyncFunction]",gn="[object Function]",dn="[object GeneratorFunction]",bn="[object Proxy]";function wn(t){if(!m(t))return!1;var n=X(t);return n==gn||n==dn||n==yn||n==bn}var mn=wn,jn=w["__core-js_shared__"],C=jn,rt=function(){var t=/[^.]+$/.exec(C&&C.keys&&C.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}();function On(t){return!!rt&&rt in t}var Sn=On,An=Function.prototype,xn=An.toString;function $n(t){if(t!=null){try{return xn.call(t)}catch(n){}try{return t+""}catch(n){}}return""}var Pn=$n,Mn=/[\\\\^$.*+?()[\\]{}|]/g,Fn=/^\\[object .+?Constructor\\]$/,En=Function.prototype,Rn=Object.prototype,Tn=En.toString,kn=Rn.hasOwnProperty,Cn=RegExp("^"+Tn.call(kn).replace(Mn,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$");function In(t){if(!m(t)||Sn(t))return!1;var n=mn(t)?Cn:Fn;return n.test(Pn(t))}var Wn=In;function Dn(t,n){return t==null?void 0:t[n]}var Gn=Dn;function Kn(t,n){var r=Gn(t,n);return Wn(r)?r:void 0}var et=Kn,Nn=et(w,"WeakMap"),ot=Nn,Un=ot&&new ot,P=Un,qn=P?function(t,n){return P.set(t,n),t}:k,at=qn,ut=Object.create,zn=function(){function t(){}return function(n){if(!m(n))return{};if(ut)return ut(n);t.prototype=n;var r=new t;return t.prototype=void 0,r}}(),I=zn;function Bn(t){return function(){var n=arguments;switch(n.length){case 0:return new t;case 1:return new t(n[0]);case 2:return new t(n[0],n[1]);case 3:return new t(n[0],n[1],n[2]);case 4:return new t(n[0],n[1],n[2],n[3]);case 5:return new t(n[0],n[1],n[2],n[3],n[4]);case 6:return new t(n[0],n[1],n[2],n[3],n[4],n[5]);case 7:return new t(n[0],n[1],n[2],n[3],n[4],n[5],n[6])}var r=I(t.prototype),e=t.apply(r,n);return m(e)?e:r}}var S=Bn,Hn=1;function Jn(t,n,r){var e=n&Hn,o=S(t);function a(){var i=this&&this!==w&&this instanceof a?o:t;return i.apply(e?r:this,arguments)}return a}var Ln=Jn;function Qn(t,n,r){switch(r.length){case 0:return t.call(n);case 1:return t.call(n,r[0]);case 2:return t.call(n,r[0],r[1]);case 3:return t.call(n,r[0],r[1],r[2])}return t.apply(n,r)}var W=Qn,Vn=Math.max;function Xn(t,n,r,e){for(var o=-1,a=t.length,i=r.length,u=-1,c=n.length,f=Vn(a-i,0),v=Array(c+f),p=!e;++u<c;)v[u]=n[u];for(;++o<i;)(p||o<a)&&(v[r[o]]=t[o]);for(;f--;)v[u++]=t[o++];return v}var it=Xn,Yn=Math.max;function Zn(t,n,r,e){for(var o=-1,a=t.length,i=-1,u=r.length,c=-1,f=n.length,v=Yn(a-u,0),p=Array(v+f),h=!e;++o<v;)p[o]=t[o];for(var l=o;++c<f;)p[l+c]=n[c];for(;++i<u;)(h||o<a)&&(p[l+r[i]]=t[o++]);return p}var ct=Zn;function tr(t,n){for(var r=t.length,e=0;r--;)t[r]===n&&++e;return e}var nr=tr;function rr(){}var D=rr,er=4294967295;function M(t){this.__wrapped__=t,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=er,this.__views__=[]}M.prototype=I(D.prototype),M.prototype.constructor=M;var G=M;function or(){}var ar=or,ur=P?function(t){return P.get(t)}:ar,vt=ur,ir={},ft=ir,cr=Object.prototype,vr=cr.hasOwnProperty;function fr(t){for(var n=t.name+"",r=ft[n],e=vr.call(ft,n)?r.length:0;e--;){var o=r[e],a=o.func;if(a==null||a==t)return o.name}return n}var lr=fr;function F(t,n){this.__wrapped__=t,this.__actions__=[],this.__chain__=!!n,this.__index__=0,this.__values__=void 0}F.prototype=I(D.prototype),F.prototype.constructor=F;var K=F;function pr(t,n){var r=-1,e=t.length;for(n||(n=Array(e));++r<e;)n[r]=t[r];return n}var lt=pr;function sr(t){if(t instanceof G)return t.clone();var n=new K(t.__wrapped__,t.__chain__);return n.__actions__=lt(t.__actions__),n.__index__=t.__index__,n.__values__=t.__values__,n}var hr=sr,_r=Object.prototype,yr=_r.hasOwnProperty;function E(t){if(Y(t)&&!Vt(t)&&!(t instanceof G)){if(t instanceof K)return t;if(yr.call(t,"__wrapped__"))return hr(t)}return new K(t)}E.prototype=D.prototype,E.prototype.constructor=E;var gr=E;function dr(t){var n=lr(t),r=gr[n];if(typeof r!="function"||!(n in G.prototype))return!1;if(t===r)return!0;var e=vt(r);return!!e&&t===e[0]}var br=dr,wr=800,mr=16,jr=Date.now;function Or(t){var n=0,r=0;return function(){var e=jr(),o=mr-(e-r);if(r=e,o>0){if(++n>=wr)return arguments[0]}else n=0;return t.apply(void 0,arguments)}}var pt=Or,Sr=pt(at),st=Sr,Ar=/\\{\\n\\/\\* \\[wrapped with (.+)\\] \\*/,xr=/,? & /;function $r(t){var n=t.match(Ar);return n?n[1].split(xr):[]}var Pr=$r,Mr=/\\{(?:\\n\\/\\* \\[wrapped with .+\\] \\*\\/)?\\n?/;function Fr(t,n){var r=n.length;if(!r)return t;var e=r-1;return n[e]=(r>1?"& ":"")+n[e],n=n.join(r>2?", ":" "),t.replace(Mr,"{\\n/* [wrapped with "+n+"] */\\n")}var Er=Fr;function Rr(t){return function(){return t}}var Tr=Rr,kr=function(){try{var t=et(Object,"defineProperty");return t({},"",{}),t}catch(n){}}(),ht=kr,Cr=ht?function(t,n){return ht(t,"toString",{configurable:!0,enumerable:!1,value:Tr(n),writable:!0})}:k,Ir=Cr,Wr=pt(Ir),_t=Wr;function Dr(t,n){for(var r=-1,e=t==null?0:t.length;++r<e&&!(n(t[r],r,t)===!1););return t}var Gr=Dr;function Kr(t,n,r,e){for(var o=t.length,a=r+(e?1:-1);e?a--:++a<o;)if(n(t[a],a,t))return a;return-1}var Nr=Kr;function Ur(t){return t!==t}var qr=Ur;function zr(t,n,r){for(var e=r-1,o=t.length;++e<o;)if(t[e]===n)return e;return-1}var Br=zr;function Hr(t,n,r){return n===n?Br(t,n,r):Nr(t,qr,r)}var Jr=Hr;function Lr(t,n){var r=t==null?0:t.length;return!!r&&Jr(t,n,0)>-1}var Qr=Lr,Vr=1,Xr=2,Yr=8,Zr=16,te=32,ne=64,re=128,ee=256,oe=512,ae=[["ary",re],["bind",Vr],["bindKey",Xr],["curry",Yr],["curryRight",Zr],["flip",oe],["partial",te],["partialRight",ne],["rearg",ee]];function ue(t,n){return Gr(ae,function(r){var e="_."+r[0];n&r[1]&&!Qr(t,e)&&t.push(e)}),t.sort()}var ie=ue;function ce(t,n,r){var e=n+"";return _t(t,Er(e,ie(Pr(e),r)))}var yt=ce,ve=1,fe=2,le=4,pe=8,gt=32,dt=64;function se(t,n,r,e,o,a,i,u,c,f){var v=n&pe,p=v?i:void 0,h=v?void 0:i,l=v?a:void 0,g=v?void 0:a;n|=v?gt:dt,n&=~(v?dt:gt),n&le||(n&=~(ve|fe));var j=[t,n,o,l,p,g,h,u,c,f],d=r.apply(void 0,j);return br(t)&&st(d,j),d.placeholder=e,yt(d,t,n)}var bt=se;function he(t){var n=t;return n.placeholder}var N=he,_e=9007199254740991,ye=/^(?:0|[1-9]\\d*)$/;function ge(t,n){var r,e=_(t);return n=(r=n)!==null&&r!==void 0?r:_e,!!n&&(e=="number"||e!="symbol"&&ye.test(t))&&t>-1&&t%1==0&&t<n}var de=ge,be=Math.min;function we(t,n){for(var r=t.length,e=be(n.length,r),o=lt(t);e--;){var a=n[e];t[e]=de(a,r)?o[a]:void 0}return t}var me=we,wt="__lodash_placeholder__";function je(t,n){for(var r=-1,e=t.length,o=0,a=[];++r<e;){var i=t[r];(i===n||i===wt)&&(t[r]=wt,a[o++]=r)}return a}var A=je,Oe=1,Se=2,Ae=8,xe=16,$e=128,Pe=512;function mt(t,n,r,e,o,a,i,u,c,f){var v=n&$e,p=n&Oe,h=n&Se,l=n&(Ae|xe),g=n&Pe,j=h?void 0:S(t);function d(){for(var b=arguments.length,s=Array(b),J=b;J--;)s[J]=arguments[J];if(l)var Ft=N(d),Xe=nr(s,Ft);if(e&&(s=it(s,e,o,l)),a&&(s=ct(s,a,i,l)),b-=Xe,l&&b<f){var Ye=A(s,Ft);return bt(t,n,mt,d.placeholder,r,s,Ye,u,c,f-b)}var Et=p?r:this,L=h?Et[t]:t;return b=s.length,u?s=me(s,u):g&&b>1&&s.reverse(),v&&c<b&&(s.length=c),this&&this!==w&&this instanceof d&&(L=j||S(L)),L.apply(Et,s)}return d}var jt=mt;function Me(t,n,r){var e=S(t);function o(){for(var a=arguments.length,i=Array(a),u=a,c=N(o);u--;)i[u]=arguments[u];var f=a<3&&i[0]!==c&&i[a-1]!==c?[]:A(i,c);if(a-=f.length,a<r)return bt(t,n,jt,o.placeholder,void 0,i,f,void 0,void 0,r-a);var v=this&&this!==w&&this instanceof o?e:t;return W(v,this,i)}return o}var Fe=Me,Ee=1;function Re(t,n,r,e){var o=n&Ee,a=S(t);function i(){for(var u=-1,c=arguments.length,f=-1,v=e.length,p=Array(v+c),h=this&&this!==w&&this instanceof i?a:t;++f<v;)p[f]=e[f];for(;c--;)p[f++]=arguments[++u];return W(h,o?r:this,p)}return i}var Te=Re,Ot="__lodash_placeholder__",U=1,ke=2,Ce=4,St=8,x=128,At=256,Ie=Math.min;function We(t,n){var r=t[1],e=n[1],o=r|e,a=o<(U|ke|x),i=e==x&&r==St||e==x&&r==At&&t[7].length<=n[8]||e==(x|At)&&n[7].length<=n[8]&&r==St;if(!(a||i))return t;e&U&&(t[2]=n[2],o|=r&U?0:Ce);var u=n[3];if(u){var c=t[3];t[3]=c?it(c,u,n[4]):u,t[4]=c?A(t[3],Ot):n[4]}return u=n[5],u&&(c=t[5],t[5]=c?ct(c,u,n[6]):u,t[6]=c?A(t[5],Ot):n[6]),u=n[7],u&&(t[7]=u),e&x&&(t[8]=t[8]==null?n[8]:Ie(t[8],n[8])),t[9]==null&&(t[9]=n[9]),t[0]=n[0],t[1]=o,t}var De=We,Ge="Expected a function",xt=1,Ke=2,q=8,z=16,B=32,$t=64,Pt=Math.max;function Ne(t,n,r,e,o,a,i,u){var c=n&Ke;if(!c&&typeof t!="function")throw new TypeError(Ge);var f=e?e.length:0;if(f||(n&=~(B|$t),e=o=void 0),i=i===void 0?i:Pt(nt(i),0),u=u===void 0?u:nt(u),f-=o?o.length:0,n&$t){var v=e,p=o;e=o=void 0}var h=c?void 0:vt(t),l=[t,n,r,e,o,v,p,a,i,u];if(h&&De(l,h),t=l[0],n=l[1],r=l[2],e=l[3],o=l[4],u=l[9]=l[9]===void 0?c?0:t.length:Pt(l[9]-f,0),!u&&n&(q|z)&&(n&=~(q|z)),!n||n==xt)var g=Ln(t,n,r);else n==q||n==z?g=Fe(t,n,u):(n==B||n==(xt|B))&&!o.length?g=Te(t,n,r,e):g=jt.apply(void 0,l);var j=h?at:st;return yt(j(g,l),t,n)}var Ue=Ne,Mt=Math.max;function qe(t,n,r){return n=Mt(n===void 0?t.length-1:n,0),function(){for(var e=arguments,o=-1,a=Mt(e.length-n,0),i=Array(a);++o<a;)i[o]=e[n+o];o=-1;for(var u=Array(n+1);++o<n;)u[o]=e[o];return u[n]=r(i),W(t,this,u)}}var ze=qe;function Be(t,n){return _t(ze(t,n,k),t+"")}var He=Be,Je=32,H=He(function(t,n){var r=A(n,N(H));return Ue(t,Je,void 0,n,r)});H.placeholder={};var Le=H;function Qe(t,n){var r=t+" "+n;return console.log(r),r}var Ve=Le(Qe,"hello");Ve("World")})();})();\n' +
			'</script>\n' +
			'</body>\n' +
			'</html>\n').end(done);
		});

	});

	describe('when a valid component and no demo is requested', function() {
		const component = '@financial-times/o-test-component@2.0.7';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "@financial-times/o-test-component@2.0.7 has no demos defined within it\'s origami.json file. See the component specification for details on how to configure demos for a component: https://origami.ft.com/spec/"').end(done);
		});

	});

	describe('when a valid component at specific version and demo are requested', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('<!DOCTYPE html>\n' +
			'<html lang="en" class="">\n' +
			'<head>\n' +
			'\t<meta charset="utf-8" />\n' +
			'\t<meta http-equiv="X-UA-Compatible" content="IE=Edge" />\n' +
			'\t<title>o-test-component: test-demo demo</title>\n' +
			'\t<meta name="viewport" content="initial-scale=1.0, width=device-width" />\n' +
			'\t<style>\n' +
			'\t\tbody {\n' +
			'\t\t\tmargin: 0;\n' +
			'\t\t}\n' +
			'\t</style>\n' +
			'\n' +
			'\t\t<script src="https://polyfill.io/v3/polyfill.min.js?features=CustomEvent&flags=gated&unknown=polyfill"></script>\n' +
			'\n' +
			'\n' +
			'\n' +
			'\n' +
			`\t\t<style>.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:'Hello world!  The square root of 64 is "8".'}\n` +
			'</style>\n' +
			'</head>\n' +
			'<body>\n' +
			'\t<div data-o-component="o-test-component" class="o-test-component">\n' +
			'\t</div>\n' +
			'\t<script src="https://registry.origami.ft.com/embedapi?autoload=resize"></script>\n' +
			'\t\t<script>(function(){"use strict";function _(R){return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?_=function(y){return typeof y}:_=function(y){return y&&typeof Symbol=="function"&&y.constructor===Symbol&&y!==Symbol.prototype?"symbol":typeof y},_(R)}(function(){var R=(typeof global=="undefined"?"undefined":_(global))=="object"&&global&&global.Object===Object&&global,T=R,y=(typeof self=="undefined"?"undefined":_(self))=="object"&&self&&self.Object===Object&&self,Rt=T||y||Function("return this")(),w=Rt,Tt=w.Symbol,$=Tt,Q=Object.prototype,kt=Q.hasOwnProperty,Ct=Q.toString,O=$?$.toStringTag:void 0;function It(t){var n=kt.call(t,O),r=t[O];try{t[O]=void 0;var e=!0}catch(a){}var o=Ct.call(t);return e&&(n?t[O]=r:delete t[O]),o}var Wt=It,Dt=Object.prototype,Gt=Dt.toString;function Kt(t){return Gt.call(t)}var Nt=Kt,Ut="[object Null]",qt="[object Undefined]",V=$?$.toStringTag:void 0;function zt(t){return t==null?t===void 0?qt:Ut:V&&V in Object(t)?Wt(t):Nt(t)}var X=zt;function Bt(t){return t!=null&&_(t)=="object"}var Y=Bt,Ht="[object Symbol]";function Jt(t){return _(t)=="symbol"||Y(t)&&X(t)==Ht}var Lt=Jt,Qt=Array.isArray,Vt=Qt,Xt=/\\s/;function Yt(t){for(var n=t.length;n--&&Xt.test(t.charAt(n)););return n}var Zt=Yt,tn=/^\\s+/;function nn(t){return t&&t.slice(0,Zt(t)+1).replace(tn,"")}var rn=nn;function en(t){var n=_(t);return t!=null&&(n=="object"||n=="function")}var m=en,Z=0/0,on=/^[-+]0x[0-9a-f]+$/i,an=/^0b[01]+$/i,un=/^0o[0-7]+$/i,cn=parseInt;function vn(t){if(typeof t=="number")return t;if(Lt(t))return Z;if(m(t)){var n=typeof t.valueOf=="function"?t.valueOf():t;t=m(n)?n+"":n}if(typeof t!="string")return t===0?t:+t;t=rn(t);var r=an.test(t);return r||un.test(t)?cn(t.slice(2),r?2:8):on.test(t)?Z:+t}var fn=vn,tt=1/0,ln=17976931348623157e292;function pn(t){if(!t)return t===0?t:0;if(t=fn(t),t===tt||t===-tt){var n=t<0?-1:1;return n*ln}return t===t?t:0}var sn=pn;function hn(t){var n=sn(t),r=n%1;return n===n?r?n-r:n:0}var nt=hn;function _n(t){return t}var k=_n,yn="[object AsyncFunction]",gn="[object Function]",dn="[object GeneratorFunction]",bn="[object Proxy]";function wn(t){if(!m(t))return!1;var n=X(t);return n==gn||n==dn||n==yn||n==bn}var mn=wn,jn=w["__core-js_shared__"],C=jn,rt=function(){var t=/[^.]+$/.exec(C&&C.keys&&C.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}();function On(t){return!!rt&&rt in t}var Sn=On,An=Function.prototype,xn=An.toString;function $n(t){if(t!=null){try{return xn.call(t)}catch(n){}try{return t+""}catch(n){}}return""}var Pn=$n,Mn=/[\\\\^$.*+?()[\\]{}|]/g,Fn=/^\\[object .+?Constructor\\]$/,En=Function.prototype,Rn=Object.prototype,Tn=En.toString,kn=Rn.hasOwnProperty,Cn=RegExp("^"+Tn.call(kn).replace(Mn,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$");function In(t){if(!m(t)||Sn(t))return!1;var n=mn(t)?Cn:Fn;return n.test(Pn(t))}var Wn=In;function Dn(t,n){return t==null?void 0:t[n]}var Gn=Dn;function Kn(t,n){var r=Gn(t,n);return Wn(r)?r:void 0}var et=Kn,Nn=et(w,"WeakMap"),ot=Nn,Un=ot&&new ot,P=Un,qn=P?function(t,n){return P.set(t,n),t}:k,at=qn,ut=Object.create,zn=function(){function t(){}return function(n){if(!m(n))return{};if(ut)return ut(n);t.prototype=n;var r=new t;return t.prototype=void 0,r}}(),I=zn;function Bn(t){return function(){var n=arguments;switch(n.length){case 0:return new t;case 1:return new t(n[0]);case 2:return new t(n[0],n[1]);case 3:return new t(n[0],n[1],n[2]);case 4:return new t(n[0],n[1],n[2],n[3]);case 5:return new t(n[0],n[1],n[2],n[3],n[4]);case 6:return new t(n[0],n[1],n[2],n[3],n[4],n[5]);case 7:return new t(n[0],n[1],n[2],n[3],n[4],n[5],n[6])}var r=I(t.prototype),e=t.apply(r,n);return m(e)?e:r}}var S=Bn,Hn=1;function Jn(t,n,r){var e=n&Hn,o=S(t);function a(){var i=this&&this!==w&&this instanceof a?o:t;return i.apply(e?r:this,arguments)}return a}var Ln=Jn;function Qn(t,n,r){switch(r.length){case 0:return t.call(n);case 1:return t.call(n,r[0]);case 2:return t.call(n,r[0],r[1]);case 3:return t.call(n,r[0],r[1],r[2])}return t.apply(n,r)}var W=Qn,Vn=Math.max;function Xn(t,n,r,e){for(var o=-1,a=t.length,i=r.length,u=-1,c=n.length,f=Vn(a-i,0),v=Array(c+f),p=!e;++u<c;)v[u]=n[u];for(;++o<i;)(p||o<a)&&(v[r[o]]=t[o]);for(;f--;)v[u++]=t[o++];return v}var it=Xn,Yn=Math.max;function Zn(t,n,r,e){for(var o=-1,a=t.length,i=-1,u=r.length,c=-1,f=n.length,v=Yn(a-u,0),p=Array(v+f),h=!e;++o<v;)p[o]=t[o];for(var l=o;++c<f;)p[l+c]=n[c];for(;++i<u;)(h||o<a)&&(p[l+r[i]]=t[o++]);return p}var ct=Zn;function tr(t,n){for(var r=t.length,e=0;r--;)t[r]===n&&++e;return e}var nr=tr;function rr(){}var D=rr,er=4294967295;function M(t){this.__wrapped__=t,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=er,this.__views__=[]}M.prototype=I(D.prototype),M.prototype.constructor=M;var G=M;function or(){}var ar=or,ur=P?function(t){return P.get(t)}:ar,vt=ur,ir={},ft=ir,cr=Object.prototype,vr=cr.hasOwnProperty;function fr(t){for(var n=t.name+"",r=ft[n],e=vr.call(ft,n)?r.length:0;e--;){var o=r[e],a=o.func;if(a==null||a==t)return o.name}return n}var lr=fr;function F(t,n){this.__wrapped__=t,this.__actions__=[],this.__chain__=!!n,this.__index__=0,this.__values__=void 0}F.prototype=I(D.prototype),F.prototype.constructor=F;var K=F;function pr(t,n){var r=-1,e=t.length;for(n||(n=Array(e));++r<e;)n[r]=t[r];return n}var lt=pr;function sr(t){if(t instanceof G)return t.clone();var n=new K(t.__wrapped__,t.__chain__);return n.__actions__=lt(t.__actions__),n.__index__=t.__index__,n.__values__=t.__values__,n}var hr=sr,_r=Object.prototype,yr=_r.hasOwnProperty;function E(t){if(Y(t)&&!Vt(t)&&!(t instanceof G)){if(t instanceof K)return t;if(yr.call(t,"__wrapped__"))return hr(t)}return new K(t)}E.prototype=D.prototype,E.prototype.constructor=E;var gr=E;function dr(t){var n=lr(t),r=gr[n];if(typeof r!="function"||!(n in G.prototype))return!1;if(t===r)return!0;var e=vt(r);return!!e&&t===e[0]}var br=dr,wr=800,mr=16,jr=Date.now;function Or(t){var n=0,r=0;return function(){var e=jr(),o=mr-(e-r);if(r=e,o>0){if(++n>=wr)return arguments[0]}else n=0;return t.apply(void 0,arguments)}}var pt=Or,Sr=pt(at),st=Sr,Ar=/\\{\\n\\/\\* \\[wrapped with (.+)\\] \\*/,xr=/,? & /;function $r(t){var n=t.match(Ar);return n?n[1].split(xr):[]}var Pr=$r,Mr=/\\{(?:\\n\\/\\* \\[wrapped with .+\\] \\*\\/)?\\n?/;function Fr(t,n){var r=n.length;if(!r)return t;var e=r-1;return n[e]=(r>1?"& ":"")+n[e],n=n.join(r>2?", ":" "),t.replace(Mr,"{\\n/* [wrapped with "+n+"] */\\n")}var Er=Fr;function Rr(t){return function(){return t}}var Tr=Rr,kr=function(){try{var t=et(Object,"defineProperty");return t({},"",{}),t}catch(n){}}(),ht=kr,Cr=ht?function(t,n){return ht(t,"toString",{configurable:!0,enumerable:!1,value:Tr(n),writable:!0})}:k,Ir=Cr,Wr=pt(Ir),_t=Wr;function Dr(t,n){for(var r=-1,e=t==null?0:t.length;++r<e&&!(n(t[r],r,t)===!1););return t}var Gr=Dr;function Kr(t,n,r,e){for(var o=t.length,a=r+(e?1:-1);e?a--:++a<o;)if(n(t[a],a,t))return a;return-1}var Nr=Kr;function Ur(t){return t!==t}var qr=Ur;function zr(t,n,r){for(var e=r-1,o=t.length;++e<o;)if(t[e]===n)return e;return-1}var Br=zr;function Hr(t,n,r){return n===n?Br(t,n,r):Nr(t,qr,r)}var Jr=Hr;function Lr(t,n){var r=t==null?0:t.length;return!!r&&Jr(t,n,0)>-1}var Qr=Lr,Vr=1,Xr=2,Yr=8,Zr=16,te=32,ne=64,re=128,ee=256,oe=512,ae=[["ary",re],["bind",Vr],["bindKey",Xr],["curry",Yr],["curryRight",Zr],["flip",oe],["partial",te],["partialRight",ne],["rearg",ee]];function ue(t,n){return Gr(ae,function(r){var e="_."+r[0];n&r[1]&&!Qr(t,e)&&t.push(e)}),t.sort()}var ie=ue;function ce(t,n,r){var e=n+"";return _t(t,Er(e,ie(Pr(e),r)))}var yt=ce,ve=1,fe=2,le=4,pe=8,gt=32,dt=64;function se(t,n,r,e,o,a,i,u,c,f){var v=n&pe,p=v?i:void 0,h=v?void 0:i,l=v?a:void 0,g=v?void 0:a;n|=v?gt:dt,n&=~(v?dt:gt),n&le||(n&=~(ve|fe));var j=[t,n,o,l,p,g,h,u,c,f],d=r.apply(void 0,j);return br(t)&&st(d,j),d.placeholder=e,yt(d,t,n)}var bt=se;function he(t){var n=t;return n.placeholder}var N=he,_e=9007199254740991,ye=/^(?:0|[1-9]\\d*)$/;function ge(t,n){var r,e=_(t);return n=(r=n)!==null&&r!==void 0?r:_e,!!n&&(e=="number"||e!="symbol"&&ye.test(t))&&t>-1&&t%1==0&&t<n}var de=ge,be=Math.min;function we(t,n){for(var r=t.length,e=be(n.length,r),o=lt(t);e--;){var a=n[e];t[e]=de(a,r)?o[a]:void 0}return t}var me=we,wt="__lodash_placeholder__";function je(t,n){for(var r=-1,e=t.length,o=0,a=[];++r<e;){var i=t[r];(i===n||i===wt)&&(t[r]=wt,a[o++]=r)}return a}var A=je,Oe=1,Se=2,Ae=8,xe=16,$e=128,Pe=512;function mt(t,n,r,e,o,a,i,u,c,f){var v=n&$e,p=n&Oe,h=n&Se,l=n&(Ae|xe),g=n&Pe,j=h?void 0:S(t);function d(){for(var b=arguments.length,s=Array(b),J=b;J--;)s[J]=arguments[J];if(l)var Ft=N(d),Xe=nr(s,Ft);if(e&&(s=it(s,e,o,l)),a&&(s=ct(s,a,i,l)),b-=Xe,l&&b<f){var Ye=A(s,Ft);return bt(t,n,mt,d.placeholder,r,s,Ye,u,c,f-b)}var Et=p?r:this,L=h?Et[t]:t;return b=s.length,u?s=me(s,u):g&&b>1&&s.reverse(),v&&c<b&&(s.length=c),this&&this!==w&&this instanceof d&&(L=j||S(L)),L.apply(Et,s)}return d}var jt=mt;function Me(t,n,r){var e=S(t);function o(){for(var a=arguments.length,i=Array(a),u=a,c=N(o);u--;)i[u]=arguments[u];var f=a<3&&i[0]!==c&&i[a-1]!==c?[]:A(i,c);if(a-=f.length,a<r)return bt(t,n,jt,o.placeholder,void 0,i,f,void 0,void 0,r-a);var v=this&&this!==w&&this instanceof o?e:t;return W(v,this,i)}return o}var Fe=Me,Ee=1;function Re(t,n,r,e){var o=n&Ee,a=S(t);function i(){for(var u=-1,c=arguments.length,f=-1,v=e.length,p=Array(v+c),h=this&&this!==w&&this instanceof i?a:t;++f<v;)p[f]=e[f];for(;c--;)p[f++]=arguments[++u];return W(h,o?r:this,p)}return i}var Te=Re,Ot="__lodash_placeholder__",U=1,ke=2,Ce=4,St=8,x=128,At=256,Ie=Math.min;function We(t,n){var r=t[1],e=n[1],o=r|e,a=o<(U|ke|x),i=e==x&&r==St||e==x&&r==At&&t[7].length<=n[8]||e==(x|At)&&n[7].length<=n[8]&&r==St;if(!(a||i))return t;e&U&&(t[2]=n[2],o|=r&U?0:Ce);var u=n[3];if(u){var c=t[3];t[3]=c?it(c,u,n[4]):u,t[4]=c?A(t[3],Ot):n[4]}return u=n[5],u&&(c=t[5],t[5]=c?ct(c,u,n[6]):u,t[6]=c?A(t[5],Ot):n[6]),u=n[7],u&&(t[7]=u),e&x&&(t[8]=t[8]==null?n[8]:Ie(t[8],n[8])),t[9]==null&&(t[9]=n[9]),t[0]=n[0],t[1]=o,t}var De=We,Ge="Expected a function",xt=1,Ke=2,q=8,z=16,B=32,$t=64,Pt=Math.max;function Ne(t,n,r,e,o,a,i,u){var c=n&Ke;if(!c&&typeof t!="function")throw new TypeError(Ge);var f=e?e.length:0;if(f||(n&=~(B|$t),e=o=void 0),i=i===void 0?i:Pt(nt(i),0),u=u===void 0?u:nt(u),f-=o?o.length:0,n&$t){var v=e,p=o;e=o=void 0}var h=c?void 0:vt(t),l=[t,n,r,e,o,v,p,a,i,u];if(h&&De(l,h),t=l[0],n=l[1],r=l[2],e=l[3],o=l[4],u=l[9]=l[9]===void 0?c?0:t.length:Pt(l[9]-f,0),!u&&n&(q|z)&&(n&=~(q|z)),!n||n==xt)var g=Ln(t,n,r);else n==q||n==z?g=Fe(t,n,u):(n==B||n==(xt|B))&&!o.length?g=Te(t,n,r,e):g=jt.apply(void 0,l);var j=h?at:st;return yt(j(g,l),t,n)}var Ue=Ne,Mt=Math.max;function qe(t,n,r){return n=Mt(n===void 0?t.length-1:n,0),function(){for(var e=arguments,o=-1,a=Mt(e.length-n,0),i=Array(a);++o<a;)i[o]=e[n+o];o=-1;for(var u=Array(n+1);++o<n;)u[o]=e[o];return u[n]=r(i),W(t,this,u)}}var ze=qe;function Be(t,n){return _t(ze(t,n,k),t+"")}var He=Be,Je=32,H=He(function(t,n){var r=A(n,N(H));return Ue(t,Je,void 0,n,r)});H.placeholder={};var Le=H;function Qe(t,n){var r=t+" "+n;return console.log(r),r}var Ve=Le(Qe,"hello");Ve("World")})();})();\n' +
			'</script>\n' +
			'</body>\n' +
			'</html>\n').end(done);
		});

	});

	describe('when a valid component at specific version and demo and brand are requested', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'internal';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('<!DOCTYPE html>\n' +
			'<html lang="en" class="">\n' +
			'<head>\n' +
			'\t<meta charset="utf-8" />\n' +
			'\t<meta http-equiv="X-UA-Compatible" content="IE=Edge" />\n' +
			'\t<title>o-test-component: test-demo demo</title>\n' +
			'\t<meta name="viewport" content="initial-scale=1.0, width=device-width" />\n' +
			'\t<style>\n' +
			'\t\tbody {\n' +
			'\t\t\tmargin: 0;\n' +
			'\t\t}\n' +
			'\t</style>\n' +
			'\n' +
			'\t\t<script src="https://polyfill.io/v3/polyfill.min.js?features=CustomEvent&flags=gated&unknown=polyfill"></script>\n' +
			'\n' +
			'\n' +
			'\n' +
			'\n' +
			`\t\t<style>.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:'Hello employee 317. Hope you find this internal tool or product helpful. The square root of 64 is "8".'}\n` +
			'</style>\n' +
			'</head>\n' +
			'<body>\n' +
			'\t<div data-o-component="o-test-component" class="o-test-component">\n' +
			'\t</div>\n' +
			'\t<script src="https://registry.origami.ft.com/embedapi?autoload=resize"></script>\n' +
			'\t\t<script>(function(){"use strict";function _(R){return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?_=function(y){return typeof y}:_=function(y){return y&&typeof Symbol=="function"&&y.constructor===Symbol&&y!==Symbol.prototype?"symbol":typeof y},_(R)}(function(){var R=(typeof global=="undefined"?"undefined":_(global))=="object"&&global&&global.Object===Object&&global,T=R,y=(typeof self=="undefined"?"undefined":_(self))=="object"&&self&&self.Object===Object&&self,Rt=T||y||Function("return this")(),w=Rt,Tt=w.Symbol,$=Tt,Q=Object.prototype,kt=Q.hasOwnProperty,Ct=Q.toString,O=$?$.toStringTag:void 0;function It(t){var n=kt.call(t,O),r=t[O];try{t[O]=void 0;var e=!0}catch(a){}var o=Ct.call(t);return e&&(n?t[O]=r:delete t[O]),o}var Wt=It,Dt=Object.prototype,Gt=Dt.toString;function Kt(t){return Gt.call(t)}var Nt=Kt,Ut="[object Null]",qt="[object Undefined]",V=$?$.toStringTag:void 0;function zt(t){return t==null?t===void 0?qt:Ut:V&&V in Object(t)?Wt(t):Nt(t)}var X=zt;function Bt(t){return t!=null&&_(t)=="object"}var Y=Bt,Ht="[object Symbol]";function Jt(t){return _(t)=="symbol"||Y(t)&&X(t)==Ht}var Lt=Jt,Qt=Array.isArray,Vt=Qt,Xt=/\\s/;function Yt(t){for(var n=t.length;n--&&Xt.test(t.charAt(n)););return n}var Zt=Yt,tn=/^\\s+/;function nn(t){return t&&t.slice(0,Zt(t)+1).replace(tn,"")}var rn=nn;function en(t){var n=_(t);return t!=null&&(n=="object"||n=="function")}var m=en,Z=0/0,on=/^[-+]0x[0-9a-f]+$/i,an=/^0b[01]+$/i,un=/^0o[0-7]+$/i,cn=parseInt;function vn(t){if(typeof t=="number")return t;if(Lt(t))return Z;if(m(t)){var n=typeof t.valueOf=="function"?t.valueOf():t;t=m(n)?n+"":n}if(typeof t!="string")return t===0?t:+t;t=rn(t);var r=an.test(t);return r||un.test(t)?cn(t.slice(2),r?2:8):on.test(t)?Z:+t}var fn=vn,tt=1/0,ln=17976931348623157e292;function pn(t){if(!t)return t===0?t:0;if(t=fn(t),t===tt||t===-tt){var n=t<0?-1:1;return n*ln}return t===t?t:0}var sn=pn;function hn(t){var n=sn(t),r=n%1;return n===n?r?n-r:n:0}var nt=hn;function _n(t){return t}var k=_n,yn="[object AsyncFunction]",gn="[object Function]",dn="[object GeneratorFunction]",bn="[object Proxy]";function wn(t){if(!m(t))return!1;var n=X(t);return n==gn||n==dn||n==yn||n==bn}var mn=wn,jn=w["__core-js_shared__"],C=jn,rt=function(){var t=/[^.]+$/.exec(C&&C.keys&&C.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}();function On(t){return!!rt&&rt in t}var Sn=On,An=Function.prototype,xn=An.toString;function $n(t){if(t!=null){try{return xn.call(t)}catch(n){}try{return t+""}catch(n){}}return""}var Pn=$n,Mn=/[\\\\^$.*+?()[\\]{}|]/g,Fn=/^\\[object .+?Constructor\\]$/,En=Function.prototype,Rn=Object.prototype,Tn=En.toString,kn=Rn.hasOwnProperty,Cn=RegExp("^"+Tn.call(kn).replace(Mn,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$");function In(t){if(!m(t)||Sn(t))return!1;var n=mn(t)?Cn:Fn;return n.test(Pn(t))}var Wn=In;function Dn(t,n){return t==null?void 0:t[n]}var Gn=Dn;function Kn(t,n){var r=Gn(t,n);return Wn(r)?r:void 0}var et=Kn,Nn=et(w,"WeakMap"),ot=Nn,Un=ot&&new ot,P=Un,qn=P?function(t,n){return P.set(t,n),t}:k,at=qn,ut=Object.create,zn=function(){function t(){}return function(n){if(!m(n))return{};if(ut)return ut(n);t.prototype=n;var r=new t;return t.prototype=void 0,r}}(),I=zn;function Bn(t){return function(){var n=arguments;switch(n.length){case 0:return new t;case 1:return new t(n[0]);case 2:return new t(n[0],n[1]);case 3:return new t(n[0],n[1],n[2]);case 4:return new t(n[0],n[1],n[2],n[3]);case 5:return new t(n[0],n[1],n[2],n[3],n[4]);case 6:return new t(n[0],n[1],n[2],n[3],n[4],n[5]);case 7:return new t(n[0],n[1],n[2],n[3],n[4],n[5],n[6])}var r=I(t.prototype),e=t.apply(r,n);return m(e)?e:r}}var S=Bn,Hn=1;function Jn(t,n,r){var e=n&Hn,o=S(t);function a(){var i=this&&this!==w&&this instanceof a?o:t;return i.apply(e?r:this,arguments)}return a}var Ln=Jn;function Qn(t,n,r){switch(r.length){case 0:return t.call(n);case 1:return t.call(n,r[0]);case 2:return t.call(n,r[0],r[1]);case 3:return t.call(n,r[0],r[1],r[2])}return t.apply(n,r)}var W=Qn,Vn=Math.max;function Xn(t,n,r,e){for(var o=-1,a=t.length,i=r.length,u=-1,c=n.length,f=Vn(a-i,0),v=Array(c+f),p=!e;++u<c;)v[u]=n[u];for(;++o<i;)(p||o<a)&&(v[r[o]]=t[o]);for(;f--;)v[u++]=t[o++];return v}var it=Xn,Yn=Math.max;function Zn(t,n,r,e){for(var o=-1,a=t.length,i=-1,u=r.length,c=-1,f=n.length,v=Yn(a-u,0),p=Array(v+f),h=!e;++o<v;)p[o]=t[o];for(var l=o;++c<f;)p[l+c]=n[c];for(;++i<u;)(h||o<a)&&(p[l+r[i]]=t[o++]);return p}var ct=Zn;function tr(t,n){for(var r=t.length,e=0;r--;)t[r]===n&&++e;return e}var nr=tr;function rr(){}var D=rr,er=4294967295;function M(t){this.__wrapped__=t,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=er,this.__views__=[]}M.prototype=I(D.prototype),M.prototype.constructor=M;var G=M;function or(){}var ar=or,ur=P?function(t){return P.get(t)}:ar,vt=ur,ir={},ft=ir,cr=Object.prototype,vr=cr.hasOwnProperty;function fr(t){for(var n=t.name+"",r=ft[n],e=vr.call(ft,n)?r.length:0;e--;){var o=r[e],a=o.func;if(a==null||a==t)return o.name}return n}var lr=fr;function F(t,n){this.__wrapped__=t,this.__actions__=[],this.__chain__=!!n,this.__index__=0,this.__values__=void 0}F.prototype=I(D.prototype),F.prototype.constructor=F;var K=F;function pr(t,n){var r=-1,e=t.length;for(n||(n=Array(e));++r<e;)n[r]=t[r];return n}var lt=pr;function sr(t){if(t instanceof G)return t.clone();var n=new K(t.__wrapped__,t.__chain__);return n.__actions__=lt(t.__actions__),n.__index__=t.__index__,n.__values__=t.__values__,n}var hr=sr,_r=Object.prototype,yr=_r.hasOwnProperty;function E(t){if(Y(t)&&!Vt(t)&&!(t instanceof G)){if(t instanceof K)return t;if(yr.call(t,"__wrapped__"))return hr(t)}return new K(t)}E.prototype=D.prototype,E.prototype.constructor=E;var gr=E;function dr(t){var n=lr(t),r=gr[n];if(typeof r!="function"||!(n in G.prototype))return!1;if(t===r)return!0;var e=vt(r);return!!e&&t===e[0]}var br=dr,wr=800,mr=16,jr=Date.now;function Or(t){var n=0,r=0;return function(){var e=jr(),o=mr-(e-r);if(r=e,o>0){if(++n>=wr)return arguments[0]}else n=0;return t.apply(void 0,arguments)}}var pt=Or,Sr=pt(at),st=Sr,Ar=/\\{\\n\\/\\* \\[wrapped with (.+)\\] \\*/,xr=/,? & /;function $r(t){var n=t.match(Ar);return n?n[1].split(xr):[]}var Pr=$r,Mr=/\\{(?:\\n\\/\\* \\[wrapped with .+\\] \\*\\/)?\\n?/;function Fr(t,n){var r=n.length;if(!r)return t;var e=r-1;return n[e]=(r>1?"& ":"")+n[e],n=n.join(r>2?", ":" "),t.replace(Mr,"{\\n/* [wrapped with "+n+"] */\\n")}var Er=Fr;function Rr(t){return function(){return t}}var Tr=Rr,kr=function(){try{var t=et(Object,"defineProperty");return t({},"",{}),t}catch(n){}}(),ht=kr,Cr=ht?function(t,n){return ht(t,"toString",{configurable:!0,enumerable:!1,value:Tr(n),writable:!0})}:k,Ir=Cr,Wr=pt(Ir),_t=Wr;function Dr(t,n){for(var r=-1,e=t==null?0:t.length;++r<e&&!(n(t[r],r,t)===!1););return t}var Gr=Dr;function Kr(t,n,r,e){for(var o=t.length,a=r+(e?1:-1);e?a--:++a<o;)if(n(t[a],a,t))return a;return-1}var Nr=Kr;function Ur(t){return t!==t}var qr=Ur;function zr(t,n,r){for(var e=r-1,o=t.length;++e<o;)if(t[e]===n)return e;return-1}var Br=zr;function Hr(t,n,r){return n===n?Br(t,n,r):Nr(t,qr,r)}var Jr=Hr;function Lr(t,n){var r=t==null?0:t.length;return!!r&&Jr(t,n,0)>-1}var Qr=Lr,Vr=1,Xr=2,Yr=8,Zr=16,te=32,ne=64,re=128,ee=256,oe=512,ae=[["ary",re],["bind",Vr],["bindKey",Xr],["curry",Yr],["curryRight",Zr],["flip",oe],["partial",te],["partialRight",ne],["rearg",ee]];function ue(t,n){return Gr(ae,function(r){var e="_."+r[0];n&r[1]&&!Qr(t,e)&&t.push(e)}),t.sort()}var ie=ue;function ce(t,n,r){var e=n+"";return _t(t,Er(e,ie(Pr(e),r)))}var yt=ce,ve=1,fe=2,le=4,pe=8,gt=32,dt=64;function se(t,n,r,e,o,a,i,u,c,f){var v=n&pe,p=v?i:void 0,h=v?void 0:i,l=v?a:void 0,g=v?void 0:a;n|=v?gt:dt,n&=~(v?dt:gt),n&le||(n&=~(ve|fe));var j=[t,n,o,l,p,g,h,u,c,f],d=r.apply(void 0,j);return br(t)&&st(d,j),d.placeholder=e,yt(d,t,n)}var bt=se;function he(t){var n=t;return n.placeholder}var N=he,_e=9007199254740991,ye=/^(?:0|[1-9]\\d*)$/;function ge(t,n){var r,e=_(t);return n=(r=n)!==null&&r!==void 0?r:_e,!!n&&(e=="number"||e!="symbol"&&ye.test(t))&&t>-1&&t%1==0&&t<n}var de=ge,be=Math.min;function we(t,n){for(var r=t.length,e=be(n.length,r),o=lt(t);e--;){var a=n[e];t[e]=de(a,r)?o[a]:void 0}return t}var me=we,wt="__lodash_placeholder__";function je(t,n){for(var r=-1,e=t.length,o=0,a=[];++r<e;){var i=t[r];(i===n||i===wt)&&(t[r]=wt,a[o++]=r)}return a}var A=je,Oe=1,Se=2,Ae=8,xe=16,$e=128,Pe=512;function mt(t,n,r,e,o,a,i,u,c,f){var v=n&$e,p=n&Oe,h=n&Se,l=n&(Ae|xe),g=n&Pe,j=h?void 0:S(t);function d(){for(var b=arguments.length,s=Array(b),J=b;J--;)s[J]=arguments[J];if(l)var Ft=N(d),Xe=nr(s,Ft);if(e&&(s=it(s,e,o,l)),a&&(s=ct(s,a,i,l)),b-=Xe,l&&b<f){var Ye=A(s,Ft);return bt(t,n,mt,d.placeholder,r,s,Ye,u,c,f-b)}var Et=p?r:this,L=h?Et[t]:t;return b=s.length,u?s=me(s,u):g&&b>1&&s.reverse(),v&&c<b&&(s.length=c),this&&this!==w&&this instanceof d&&(L=j||S(L)),L.apply(Et,s)}return d}var jt=mt;function Me(t,n,r){var e=S(t);function o(){for(var a=arguments.length,i=Array(a),u=a,c=N(o);u--;)i[u]=arguments[u];var f=a<3&&i[0]!==c&&i[a-1]!==c?[]:A(i,c);if(a-=f.length,a<r)return bt(t,n,jt,o.placeholder,void 0,i,f,void 0,void 0,r-a);var v=this&&this!==w&&this instanceof o?e:t;return W(v,this,i)}return o}var Fe=Me,Ee=1;function Re(t,n,r,e){var o=n&Ee,a=S(t);function i(){for(var u=-1,c=arguments.length,f=-1,v=e.length,p=Array(v+c),h=this&&this!==w&&this instanceof i?a:t;++f<v;)p[f]=e[f];for(;c--;)p[f++]=arguments[++u];return W(h,o?r:this,p)}return i}var Te=Re,Ot="__lodash_placeholder__",U=1,ke=2,Ce=4,St=8,x=128,At=256,Ie=Math.min;function We(t,n){var r=t[1],e=n[1],o=r|e,a=o<(U|ke|x),i=e==x&&r==St||e==x&&r==At&&t[7].length<=n[8]||e==(x|At)&&n[7].length<=n[8]&&r==St;if(!(a||i))return t;e&U&&(t[2]=n[2],o|=r&U?0:Ce);var u=n[3];if(u){var c=t[3];t[3]=c?it(c,u,n[4]):u,t[4]=c?A(t[3],Ot):n[4]}return u=n[5],u&&(c=t[5],t[5]=c?ct(c,u,n[6]):u,t[6]=c?A(t[5],Ot):n[6]),u=n[7],u&&(t[7]=u),e&x&&(t[8]=t[8]==null?n[8]:Ie(t[8],n[8])),t[9]==null&&(t[9]=n[9]),t[0]=n[0],t[1]=o,t}var De=We,Ge="Expected a function",xt=1,Ke=2,q=8,z=16,B=32,$t=64,Pt=Math.max;function Ne(t,n,r,e,o,a,i,u){var c=n&Ke;if(!c&&typeof t!="function")throw new TypeError(Ge);var f=e?e.length:0;if(f||(n&=~(B|$t),e=o=void 0),i=i===void 0?i:Pt(nt(i),0),u=u===void 0?u:nt(u),f-=o?o.length:0,n&$t){var v=e,p=o;e=o=void 0}var h=c?void 0:vt(t),l=[t,n,r,e,o,v,p,a,i,u];if(h&&De(l,h),t=l[0],n=l[1],r=l[2],e=l[3],o=l[4],u=l[9]=l[9]===void 0?c?0:t.length:Pt(l[9]-f,0),!u&&n&(q|z)&&(n&=~(q|z)),!n||n==xt)var g=Ln(t,n,r);else n==q||n==z?g=Fe(t,n,u):(n==B||n==(xt|B))&&!o.length?g=Te(t,n,r,e):g=jt.apply(void 0,l);var j=h?at:st;return yt(j(g,l),t,n)}var Ue=Ne,Mt=Math.max;function qe(t,n,r){return n=Mt(n===void 0?t.length-1:n,0),function(){for(var e=arguments,o=-1,a=Mt(e.length-n,0),i=Array(a);++o<a;)i[o]=e[n+o];o=-1;for(var u=Array(n+1);++o<n;)u[o]=e[o];return u[n]=r(i),W(t,this,u)}}var ze=qe;function Be(t,n){return _t(ze(t,n,k),t+"")}var He=Be,Je=32,H=He(function(t,n){var r=A(n,N(H));return Ue(t,Je,void 0,n,r)});H.placeholder={};var Le=H;function Qe(t,n){var r=t+" "+n;return console.log(r),r}var Ve=Le(Qe,"hello");Ve("World")})();})();\n' +
			'</script>\n' +
			'</body>\n' +
			'</html>\n').end(done);
		});

	});

	describe('when a valid component at specific version and demo which contains mustache compilation errors are requested', function() {
		const component = '@financial-times/o-test-component@2.0.10';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "@financial-times/o-test-component@2.0.10\'s demo named \\"test-demo\\" could not be built due to a compilation error within the Mustache templates: Unclosed section \\"causing-syntax-error-by-not-closing-section\\" at 126"').end(done);
		});

	});

	describe('when a valid component at specific version and demo which contains sass compilation errors are requested', function() {
		const component = '@financial-times/o-test-component@2.0.11';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(response => {
				const body = response.text;
				assert.include(body, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.0.11\'s demo named \\"test-demo\\" could not be built due to a compilation error within the Sass: Error: ');
			}).end(done);
		});

	});

	describe('when a valid component at specific version and demo which contains javascript compilation errors are requested', function() {
		const component = '@financial-times/o-test-component@2.0.12';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(response => {
				const body = response.text;
				assert.include(body, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.0.12\'s demo named \\"test-demo\\" could not be built due to a compilation error within the JavaScript: ');
			}).end(done);
		});

	});

	describe('when a valid component and non-existent demo are requested', function() {
		const component = '@financial-times/o-test-component@v2.0.1';
		const demo = 'NOTADEMO';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "@financial-times/o-test-component@v2.0.1 has no demo with the requested name: NOTADEMO"').end(done);
		});

	});

	describe('when a valid component at specific version but non-existent demo are requested', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'NOTADEMO';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "@financial-times/o-test-component@2.0.1 has no demo with the requested name: NOTADEMO"').end(done);
		});

	});

	describe('when a valid component at non-existent version is requested', function() {
		const component = '@financial-times/o-test-component@99.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect('Origami Build Service returned an error: "@financial-times/o-test-component@99.0.0 is not in the npm registry"').end(done);
		});

	});

	describe('when a non origami component is requested', function() {
		const component = 'jquery@3.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The module query parameter can only contain modules from the @financial-times namespace. The module being requested was: jquery."')
				.end(done);
		});
	});

	describe('when a valid component which does not have an origami manifest is requested', function() {
		const component = '@financial-times/o-test-component@2.0.13';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "@financial-times/o-test-component@2.0.13 is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components."')
				.end(done);
		});
	});

	describe('when an origami specification v1 component is requested', function() {
		const component = '@financial-times/o-test-component@1.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "@financial-times/o-test-component@1.0.0 is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components."')
				.end(done);
		});
	});

	describe('when the request is missing the brand parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The brand query parameter must be a string. Either `master`, `internal`, or `whitelabel`."')
				.end(done);
		});
	});
	describe('when the request contains an invalid brand parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'denshiba';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The brand query parameter must be either `master`, `internal`, or `whitelabel`."')
				.end(done);
		});
	});
	describe('when the request is missing the demo parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The demo query parameter must be a string."')
				.end(done);
		});
	});
	describe('when the request contains an invalid demo parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo[]=foo&demo[]=bar&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The demo query parameter must be a string."')
				.end(done);
		});
	});
	describe('when the request is missing the system_code parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The system_code query parameter must be a string."')
				.end(done);
		});
	});
	describe('when the request contains an invalid system_code parameter', function() {
		const component = '@financial-times/o-test-component@2.0.1';
		const demo = 'test-demo';
		const system_code = 'not_a_system_code_137';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The system_code query parameter must be a valid Biz-Ops System Code."')
				.end(done);
		});
	});
	describe('when the request is missing the module parameter', function() {
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The module query parameter must be a string."')
				.end(done);
		});
	});
	describe('when the request contains an invalid module parameter', function() {
		const component = 'not:a^valid@module';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/demo?module=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request
				.expect('Origami Build Service returned an error: "The module query parameter can only contain modules from the @financial-times namespace. The module being requested was: not:a^valid."')
				.end(done);
		});
	});

});
