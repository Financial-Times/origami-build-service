'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /v3/demo', function() {
	this.timeout(60000);
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
			this.request.expect('<!DOCTYPE html>\n<html lang="en" class="">\n<head>\n\t<meta charset="utf-8" />\n\t<meta http-equiv="X-UA-Compatible" content="IE=Edge" />\n\t<title>o-test-component: test-demo demo</title>\n\t<meta name="viewport" content="initial-scale=1.0, width=device-width" />\n\t<style>\n\t\tbody {\n\t\t\tmargin: 0;\n\t\t}\n\t</style>\n\n\t\t<script src="https://polyfill.io/v3/polyfill.min.js?features=CustomEvent&flags=gated&unknown=polyfill"></script>\n\n\n\n\n\t\t<style>.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:\'Hello world!  The square root of 64 is "8".\'}\n</style>\n</head>\n<body>\n\t<div data-o-component="o-test-component" class="o-test-component">\n\t</div>\n\t<script src="https://registry.origami.ft.com/embedapi?autoload=resize"></script>\n\t\t<script>(function(){"use strict";function _(R){return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?_=function(y){return typeof y}:_=function(y){return y&&typeof Symbol=="function"&&y.constructor===Symbol&&y!==Symbol.prototype?"symbol":typeof y},_(R)}(function(){var R=(typeof global=="undefined"?"undefined":_(global))=="object"&&global&&global.Object===Object&&global,T=R,y=(typeof self=="undefined"?"undefined":_(self))=="object"&&self&&self.Object===Object&&self,Rt=T||y||Function("return this")(),w=Rt,Tt=w.Symbol,$=Tt,Q=Object.prototype,kt=Q.hasOwnProperty,Ct=Q.toString,O=$?$.toStringTag:void 0;function It(t){var r=kt.call(t,O),n=t[O];try{t[O]=void 0;var e=!0}catch(a){}var o=Ct.call(t);return e&&(r?t[O]=n:delete t[O]),o}var Wt=It,Dt=Object.prototype,Gt=Dt.toString;function Kt(t){return Gt.call(t)}var Nt=Kt,Ut="[object Null]",qt="[object Undefined]",V=$?$.toStringTag:void 0;function zt(t){return t==null?t===void 0?qt:Ut:V&&V in Object(t)?Wt(t):Nt(t)}var X=zt;function Bt(t){return t!=null&&_(t)=="object"}var Y=Bt,Ht="[object Symbol]";function Jt(t){return _(t)=="symbol"||Y(t)&&X(t)==Ht}var Lt=Jt,Qt=Array.isArray,Vt=Qt,Xt=/\\s/;function Yt(t){for(var r=t.length;r--&&Xt.test(t.charAt(r)););return r}var Zt=Yt,tr=/^\\s+/;function rr(t){return t&&t.slice(0,Zt(t)+1).replace(tr,"")}var nr=rr;function er(t){var r=_(t);return t!=null&&(r=="object"||r=="function")}var m=er,Z=0/0,or=/^[-+]0x[0-9a-f]+$/i,ar=/^0b[01]+$/i,ur=/^0o[0-7]+$/i,ir=parseInt;function vr(t){if(typeof t=="number")return t;if(Lt(t))return Z;if(m(t)){var r=typeof t.valueOf=="function"?t.valueOf():t;t=m(r)?r+"":r}if(typeof t!="string")return t===0?t:+t;t=nr(t);var n=ar.test(t);return n||ur.test(t)?ir(t.slice(2),n?2:8):or.test(t)?Z:+t}var cr=vr,tt=1/0,fr=17976931348623157e292;function lr(t){if(!t)return t===0?t:0;if(t=cr(t),t===tt||t===-tt){var r=t<0?-1:1;return r*fr}return t===t?t:0}var pr=lr;function sr(t){var r=pr(t),n=r%1;return r===r?n?r-n:r:0}var rt=sr;function hr(t){return t}var k=hr,_r="[object AsyncFunction]",yr="[object Function]",gr="[object GeneratorFunction]",dr="[object Proxy]";function br(t){if(!m(t))return!1;var r=X(t);return r==yr||r==gr||r==_r||r==dr}var wr=br,mr=w["__core-js_shared__"],C=mr,nt=function(){var t=/[^.]+$/.exec(C&&C.keys&&C.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}();function jr(t){return!!nt&&nt in t}var Or=jr,Sr=Function.prototype,Ar=Sr.toString;function xr(t){if(t!=null){try{return Ar.call(t)}catch(r){}try{return t+""}catch(r){}}return""}var $r=xr,Pr=/[\\\\^$.*+?()[\\]{}|]/g,Mr=/^\\[object .+?Constructor\\]$/,Fr=Function.prototype,Er=Object.prototype,Rr=Fr.toString,Tr=Er.hasOwnProperty,kr=RegExp("^"+Rr.call(Tr).replace(Pr,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$");function Cr(t){if(!m(t)||Or(t))return!1;var r=wr(t)?kr:Mr;return r.test($r(t))}var Ir=Cr;function Wr(t,r){return t==null?void 0:t[r]}var Dr=Wr;function Gr(t,r){var n=Dr(t,r);return Ir(n)?n:void 0}var et=Gr,Kr=et(w,"WeakMap"),ot=Kr,Nr=ot&&new ot,P=Nr,Ur=P?function(t,r){return P.set(t,r),t}:k,at=Ur,ut=Object.create,qr=function(){function t(){}return function(r){if(!m(r))return{};if(ut)return ut(r);t.prototype=r;var n=new t;return t.prototype=void 0,n}}(),I=qr;function zr(t){return function(){var r=arguments;switch(r.length){case 0:return new t;case 1:return new t(r[0]);case 2:return new t(r[0],r[1]);case 3:return new t(r[0],r[1],r[2]);case 4:return new t(r[0],r[1],r[2],r[3]);case 5:return new t(r[0],r[1],r[2],r[3],r[4]);case 6:return new t(r[0],r[1],r[2],r[3],r[4],r[5]);case 7:return new t(r[0],r[1],r[2],r[3],r[4],r[5],r[6])}var n=I(t.prototype),e=t.apply(n,r);return m(e)?e:n}}var S=zr,Br=1;function Hr(t,r,n){var e=r&Br,o=S(t);function a(){var i=this&&this!==w&&this instanceof a?o:t;return i.apply(e?n:this,arguments)}return a}var Jr=Hr;function Lr(t,r,n){switch(n.length){case 0:return t.call(r);case 1:return t.call(r,n[0]);case 2:return t.call(r,n[0],n[1]);case 3:return t.call(r,n[0],n[1],n[2])}return t.apply(r,n)}var W=Lr,Qr=Math.max;function Vr(t,r,n,e){for(var o=-1,a=t.length,i=n.length,u=-1,v=r.length,f=Qr(a-i,0),c=Array(v+f),p=!e;++u<v;)c[u]=r[u];for(;++o<i;)(p||o<a)&&(c[n[o]]=t[o]);for(;f--;)c[u++]=t[o++];return c}var it=Vr,Xr=Math.max;function Yr(t,r,n,e){for(var o=-1,a=t.length,i=-1,u=n.length,v=-1,f=r.length,c=Xr(a-u,0),p=Array(c+f),h=!e;++o<c;)p[o]=t[o];for(var l=o;++v<f;)p[l+v]=r[v];for(;++i<u;)(h||o<a)&&(p[l+n[i]]=t[o++]);return p}var vt=Yr;function Zr(t,r){for(var n=t.length,e=0;n--;)t[n]===r&&++e;return e}var tn=Zr;function rn(){}var D=rn,nn=4294967295;function M(t){this.__wrapped__=t,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=nn,this.__views__=[]}M.prototype=I(D.prototype),M.prototype.constructor=M;var G=M;function en(){}var on=en,an=P?function(t){return P.get(t)}:on,ct=an,un={},ft=un,vn=Object.prototype,cn=vn.hasOwnProperty;function fn(t){for(var r=t.name+"",n=ft[r],e=cn.call(ft,r)?n.length:0;e--;){var o=n[e],a=o.func;if(a==null||a==t)return o.name}return r}var ln=fn;function F(t,r){this.__wrapped__=t,this.__actions__=[],this.__chain__=!!r,this.__index__=0,this.__values__=void 0}F.prototype=I(D.prototype),F.prototype.constructor=F;var K=F;function pn(t,r){var n=-1,e=t.length;for(r||(r=Array(e));++n<e;)r[n]=t[n];return r}var lt=pn;function sn(t){if(t instanceof G)return t.clone();var r=new K(t.__wrapped__,t.__chain__);return r.__actions__=lt(t.__actions__),r.__index__=t.__index__,r.__values__=t.__values__,r}var hn=sn,_n=Object.prototype,yn=_n.hasOwnProperty;function E(t){if(Y(t)&&!Vt(t)&&!(t instanceof G)){if(t instanceof K)return t;if(yn.call(t,"__wrapped__"))return hn(t)}return new K(t)}E.prototype=D.prototype,E.prototype.constructor=E;var gn=E;function dn(t){var r=ln(t),n=gn[r];if(typeof n!="function"||!(r in G.prototype))return!1;if(t===n)return!0;var e=ct(n);return!!e&&t===e[0]}var bn=dn,wn=800,mn=16,jn=Date.now;function On(t){var r=0,n=0;return function(){var e=jn(),o=mn-(e-n);if(n=e,o>0){if(++r>=wn)return arguments[0]}else r=0;return t.apply(void 0,arguments)}}var pt=On,Sn=pt(at),st=Sn,An=/\\{\\n\\/\\* \\[wrapped with (.+)\\] \\*/,xn=/,? & /;function $n(t){var r=t.match(An);return r?r[1].split(xn):[]}var Pn=$n,Mn=/\\{(?:\\n\\/\\* \\[wrapped with .+\\] \\*\\/)?\\n?/;function Fn(t,r){var n=r.length;if(!n)return t;var e=n-1;return r[e]=(n>1?"& ":"")+r[e],r=r.join(n>2?", ":" "),t.replace(Mn,"{\\n/* [wrapped with "+r+"] */\\n")}var En=Fn;function Rn(t){return function(){return t}}var Tn=Rn,kn=function(){try{var t=et(Object,"defineProperty");return t({},"",{}),t}catch(r){}}(),ht=kn,Cn=ht?function(t,r){return ht(t,"toString",{configurable:!0,enumerable:!1,value:Tn(r),writable:!0})}:k,In=Cn,Wn=pt(In),_t=Wn;function Dn(t,r){for(var n=-1,e=t==null?0:t.length;++n<e&&r(t[n],n,t)!==!1;);return t}var Gn=Dn;function Kn(t,r,n,e){for(var o=t.length,a=n+(e?1:-1);e?a--:++a<o;)if(r(t[a],a,t))return a;return-1}var Nn=Kn;function Un(t){return t!==t}var qn=Un;function zn(t,r,n){for(var e=n-1,o=t.length;++e<o;)if(t[e]===r)return e;return-1}var Bn=zn;function Hn(t,r,n){return r===r?Bn(t,r,n):Nn(t,qn,n)}var Jn=Hn;function Ln(t,r){var n=t==null?0:t.length;return!!n&&Jn(t,r,0)>-1}var Qn=Ln,Vn=1,Xn=2,Yn=8,Zn=16,te=32,re=64,ne=128,ee=256,oe=512,ae=[["ary",ne],["bind",Vn],["bindKey",Xn],["curry",Yn],["curryRight",Zn],["flip",oe],["partial",te],["partialRight",re],["rearg",ee]];function ue(t,r){return Gn(ae,function(n){var e="_."+n[0];r&n[1]&&!Qn(t,e)&&t.push(e)}),t.sort()}var ie=ue;function ve(t,r,n){var e=r+"";return _t(t,En(e,ie(Pn(e),n)))}var yt=ve,ce=1,fe=2,le=4,pe=8,gt=32,dt=64;function se(t,r,n,e,o,a,i,u,v,f){var c=r&pe,p=c?i:void 0,h=c?void 0:i,l=c?a:void 0,g=c?void 0:a;r|=c?gt:dt,r&=~(c?dt:gt),r&le||(r&=~(ce|fe));var j=[t,r,o,l,p,g,h,u,v,f],d=n.apply(void 0,j);return bn(t)&&st(d,j),d.placeholder=e,yt(d,t,r)}var bt=se;function he(t){var r=t;return r.placeholder}var N=he,_e=9007199254740991,ye=/^(?:0|[1-9]\\d*)$/;function ge(t,r){var n,e=_(t);return r=(n=r)!==null&&n!==void 0?n:_e,!!r&&(e=="number"||e!="symbol"&&ye.test(t))&&t>-1&&t%1==0&&t<r}var de=ge,be=Math.min;function we(t,r){for(var n=t.length,e=be(r.length,n),o=lt(t);e--;){var a=r[e];t[e]=de(a,n)?o[a]:void 0}return t}var me=we,wt="__lodash_placeholder__";function je(t,r){for(var n=-1,e=t.length,o=0,a=[];++n<e;){var i=t[n];(i===r||i===wt)&&(t[n]=wt,a[o++]=n)}return a}var A=je,Oe=1,Se=2,Ae=8,xe=16,$e=128,Pe=512;function mt(t,r,n,e,o,a,i,u,v,f){var c=r&$e,p=r&Oe,h=r&Se,l=r&(Ae|xe),g=r&Pe,j=h?void 0:S(t);function d(){for(var b=arguments.length,s=Array(b),J=b;J--;)s[J]=arguments[J];if(l)var Ft=N(d),Xe=tn(s,Ft);if(e&&(s=it(s,e,o,l)),a&&(s=vt(s,a,i,l)),b-=Xe,l&&b<f){var Ye=A(s,Ft);return bt(t,r,mt,d.placeholder,n,s,Ye,u,v,f-b)}var Et=p?n:this,L=h?Et[t]:t;return b=s.length,u?s=me(s,u):g&&b>1&&s.reverse(),c&&v<b&&(s.length=v),this&&this!==w&&this instanceof d&&(L=j||S(L)),L.apply(Et,s)}return d}var jt=mt;function Me(t,r,n){var e=S(t);function o(){for(var a=arguments.length,i=Array(a),u=a,v=N(o);u--;)i[u]=arguments[u];var f=a<3&&i[0]!==v&&i[a-1]!==v?[]:A(i,v);if(a-=f.length,a<n)return bt(t,r,jt,o.placeholder,void 0,i,f,void 0,void 0,n-a);var c=this&&this!==w&&this instanceof o?e:t;return W(c,this,i)}return o}var Fe=Me,Ee=1;function Re(t,r,n,e){var o=r&Ee,a=S(t);function i(){for(var u=-1,v=arguments.length,f=-1,c=e.length,p=Array(c+v),h=this&&this!==w&&this instanceof i?a:t;++f<c;)p[f]=e[f];for(;v--;)p[f++]=arguments[++u];return W(h,o?n:this,p)}return i}var Te=Re,Ot="__lodash_placeholder__",U=1,ke=2,Ce=4,St=8,x=128,At=256,Ie=Math.min;function We(t,r){var n=t[1],e=r[1],o=n|e,a=o<(U|ke|x),i=e==x&&n==St||e==x&&n==At&&t[7].length<=r[8]||e==(x|At)&&r[7].length<=r[8]&&n==St;if(!(a||i))return t;e&U&&(t[2]=r[2],o|=n&U?0:Ce);var u=r[3];if(u){var v=t[3];t[3]=v?it(v,u,r[4]):u,t[4]=v?A(t[3],Ot):r[4]}return u=r[5],u&&(v=t[5],t[5]=v?vt(v,u,r[6]):u,t[6]=v?A(t[5],Ot):r[6]),u=r[7],u&&(t[7]=u),e&x&&(t[8]=t[8]==null?r[8]:Ie(t[8],r[8])),t[9]==null&&(t[9]=r[9]),t[0]=r[0],t[1]=o,t}var De=We,Ge="Expected a function",xt=1,Ke=2,q=8,z=16,B=32,$t=64,Pt=Math.max;function Ne(t,r,n,e,o,a,i,u){var v=r&Ke;if(!v&&typeof t!="function")throw new TypeError(Ge);var f=e?e.length:0;if(f||(r&=~(B|$t),e=o=void 0),i=i===void 0?i:Pt(rt(i),0),u=u===void 0?u:rt(u),f-=o?o.length:0,r&$t){var c=e,p=o;e=o=void 0}var h=v?void 0:ct(t),l=[t,r,n,e,o,c,p,a,i,u];if(h&&De(l,h),t=l[0],r=l[1],n=l[2],e=l[3],o=l[4],u=l[9]=l[9]===void 0?v?0:t.length:Pt(l[9]-f,0),!u&&r&(q|z)&&(r&=~(q|z)),!r||r==xt)var g=Jr(t,r,n);else r==q||r==z?g=Fe(t,r,u):(r==B||r==(xt|B))&&!o.length?g=Te(t,r,n,e):g=jt.apply(void 0,l);var j=h?at:st;return yt(j(g,l),t,r)}var Ue=Ne,Mt=Math.max;function qe(t,r,n){return r=Mt(r===void 0?t.length-1:r,0),function(){for(var e=arguments,o=-1,a=Mt(e.length-r,0),i=Array(a);++o<a;)i[o]=e[r+o];o=-1;for(var u=Array(r+1);++o<r;)u[o]=e[o];return u[r]=n(i),W(t,this,u)}}var ze=qe;function Be(t,r){return _t(ze(t,r,k),t+"")}var He=Be,Je=32,H=He(function(t,r){var n=A(r,N(H));return Ue(t,Je,void 0,r,n)});H.placeholder={};var Le=H;function Qe(t,r){var n=t+" "+r;return console.log(n),n}var Ve=Le(Qe,"hello");Ve("World")})();})();\n</script>\n</body>\n</html>\n').end(done);
		});

	});

	describe('when a valid component with no demos is requested', function() {
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

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
            it('should respond with the expected `Content-Type` header', function(done) {
                this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
            });

            it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
                this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
            });
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
			this.request.expect('<!DOCTYPE html>\n<html lang="en" class="">\n<head>\n\t<meta charset="utf-8" />\n\t<meta http-equiv="X-UA-Compatible" content="IE=Edge" />\n\t<title>o-test-component: test-demo demo</title>\n\t<meta name="viewport" content="initial-scale=1.0, width=device-width" />\n\t<style>\n\t\tbody {\n\t\t\tmargin: 0;\n\t\t}\n\t</style>\n\n\t\t<script src="https://polyfill.io/v3/polyfill.min.js?features=CustomEvent&flags=gated&unknown=polyfill"></script>\n\n\n\n\n\t\t<style>.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:\'Hello world!  The square root of 64 is "8".\'}\n</style>\n</head>\n<body>\n\t<div data-o-component="o-test-component" class="o-test-component">\n\t</div>\n\t<script src="https://registry.origami.ft.com/embedapi?autoload=resize"></script>\n\t\t<script>(function(){"use strict";function _(R){return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?_=function(y){return typeof y}:_=function(y){return y&&typeof Symbol=="function"&&y.constructor===Symbol&&y!==Symbol.prototype?"symbol":typeof y},_(R)}(function(){var R=(typeof global=="undefined"?"undefined":_(global))=="object"&&global&&global.Object===Object&&global,T=R,y=(typeof self=="undefined"?"undefined":_(self))=="object"&&self&&self.Object===Object&&self,Rt=T||y||Function("return this")(),w=Rt,Tt=w.Symbol,$=Tt,Q=Object.prototype,kt=Q.hasOwnProperty,Ct=Q.toString,O=$?$.toStringTag:void 0;function It(t){var r=kt.call(t,O),n=t[O];try{t[O]=void 0;var e=!0}catch(a){}var o=Ct.call(t);return e&&(r?t[O]=n:delete t[O]),o}var Wt=It,Dt=Object.prototype,Gt=Dt.toString;function Kt(t){return Gt.call(t)}var Nt=Kt,Ut="[object Null]",qt="[object Undefined]",V=$?$.toStringTag:void 0;function zt(t){return t==null?t===void 0?qt:Ut:V&&V in Object(t)?Wt(t):Nt(t)}var X=zt;function Bt(t){return t!=null&&_(t)=="object"}var Y=Bt,Ht="[object Symbol]";function Jt(t){return _(t)=="symbol"||Y(t)&&X(t)==Ht}var Lt=Jt,Qt=Array.isArray,Vt=Qt,Xt=/\\s/;function Yt(t){for(var r=t.length;r--&&Xt.test(t.charAt(r)););return r}var Zt=Yt,tr=/^\\s+/;function rr(t){return t&&t.slice(0,Zt(t)+1).replace(tr,"")}var nr=rr;function er(t){var r=_(t);return t!=null&&(r=="object"||r=="function")}var m=er,Z=0/0,or=/^[-+]0x[0-9a-f]+$/i,ar=/^0b[01]+$/i,ur=/^0o[0-7]+$/i,ir=parseInt;function vr(t){if(typeof t=="number")return t;if(Lt(t))return Z;if(m(t)){var r=typeof t.valueOf=="function"?t.valueOf():t;t=m(r)?r+"":r}if(typeof t!="string")return t===0?t:+t;t=nr(t);var n=ar.test(t);return n||ur.test(t)?ir(t.slice(2),n?2:8):or.test(t)?Z:+t}var cr=vr,tt=1/0,fr=17976931348623157e292;function lr(t){if(!t)return t===0?t:0;if(t=cr(t),t===tt||t===-tt){var r=t<0?-1:1;return r*fr}return t===t?t:0}var pr=lr;function sr(t){var r=pr(t),n=r%1;return r===r?n?r-n:r:0}var rt=sr;function hr(t){return t}var k=hr,_r="[object AsyncFunction]",yr="[object Function]",gr="[object GeneratorFunction]",dr="[object Proxy]";function br(t){if(!m(t))return!1;var r=X(t);return r==yr||r==gr||r==_r||r==dr}var wr=br,mr=w["__core-js_shared__"],C=mr,nt=function(){var t=/[^.]+$/.exec(C&&C.keys&&C.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}();function jr(t){return!!nt&&nt in t}var Or=jr,Sr=Function.prototype,Ar=Sr.toString;function xr(t){if(t!=null){try{return Ar.call(t)}catch(r){}try{return t+""}catch(r){}}return""}var $r=xr,Pr=/[\\\\^$.*+?()[\\]{}|]/g,Mr=/^\\[object .+?Constructor\\]$/,Fr=Function.prototype,Er=Object.prototype,Rr=Fr.toString,Tr=Er.hasOwnProperty,kr=RegExp("^"+Rr.call(Tr).replace(Pr,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$");function Cr(t){if(!m(t)||Or(t))return!1;var r=wr(t)?kr:Mr;return r.test($r(t))}var Ir=Cr;function Wr(t,r){return t==null?void 0:t[r]}var Dr=Wr;function Gr(t,r){var n=Dr(t,r);return Ir(n)?n:void 0}var et=Gr,Kr=et(w,"WeakMap"),ot=Kr,Nr=ot&&new ot,P=Nr,Ur=P?function(t,r){return P.set(t,r),t}:k,at=Ur,ut=Object.create,qr=function(){function t(){}return function(r){if(!m(r))return{};if(ut)return ut(r);t.prototype=r;var n=new t;return t.prototype=void 0,n}}(),I=qr;function zr(t){return function(){var r=arguments;switch(r.length){case 0:return new t;case 1:return new t(r[0]);case 2:return new t(r[0],r[1]);case 3:return new t(r[0],r[1],r[2]);case 4:return new t(r[0],r[1],r[2],r[3]);case 5:return new t(r[0],r[1],r[2],r[3],r[4]);case 6:return new t(r[0],r[1],r[2],r[3],r[4],r[5]);case 7:return new t(r[0],r[1],r[2],r[3],r[4],r[5],r[6])}var n=I(t.prototype),e=t.apply(n,r);return m(e)?e:n}}var S=zr,Br=1;function Hr(t,r,n){var e=r&Br,o=S(t);function a(){var i=this&&this!==w&&this instanceof a?o:t;return i.apply(e?n:this,arguments)}return a}var Jr=Hr;function Lr(t,r,n){switch(n.length){case 0:return t.call(r);case 1:return t.call(r,n[0]);case 2:return t.call(r,n[0],n[1]);case 3:return t.call(r,n[0],n[1],n[2])}return t.apply(r,n)}var W=Lr,Qr=Math.max;function Vr(t,r,n,e){for(var o=-1,a=t.length,i=n.length,u=-1,v=r.length,f=Qr(a-i,0),c=Array(v+f),p=!e;++u<v;)c[u]=r[u];for(;++o<i;)(p||o<a)&&(c[n[o]]=t[o]);for(;f--;)c[u++]=t[o++];return c}var it=Vr,Xr=Math.max;function Yr(t,r,n,e){for(var o=-1,a=t.length,i=-1,u=n.length,v=-1,f=r.length,c=Xr(a-u,0),p=Array(c+f),h=!e;++o<c;)p[o]=t[o];for(var l=o;++v<f;)p[l+v]=r[v];for(;++i<u;)(h||o<a)&&(p[l+n[i]]=t[o++]);return p}var vt=Yr;function Zr(t,r){for(var n=t.length,e=0;n--;)t[n]===r&&++e;return e}var tn=Zr;function rn(){}var D=rn,nn=4294967295;function M(t){this.__wrapped__=t,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=nn,this.__views__=[]}M.prototype=I(D.prototype),M.prototype.constructor=M;var G=M;function en(){}var on=en,an=P?function(t){return P.get(t)}:on,ct=an,un={},ft=un,vn=Object.prototype,cn=vn.hasOwnProperty;function fn(t){for(var r=t.name+"",n=ft[r],e=cn.call(ft,r)?n.length:0;e--;){var o=n[e],a=o.func;if(a==null||a==t)return o.name}return r}var ln=fn;function F(t,r){this.__wrapped__=t,this.__actions__=[],this.__chain__=!!r,this.__index__=0,this.__values__=void 0}F.prototype=I(D.prototype),F.prototype.constructor=F;var K=F;function pn(t,r){var n=-1,e=t.length;for(r||(r=Array(e));++n<e;)r[n]=t[n];return r}var lt=pn;function sn(t){if(t instanceof G)return t.clone();var r=new K(t.__wrapped__,t.__chain__);return r.__actions__=lt(t.__actions__),r.__index__=t.__index__,r.__values__=t.__values__,r}var hn=sn,_n=Object.prototype,yn=_n.hasOwnProperty;function E(t){if(Y(t)&&!Vt(t)&&!(t instanceof G)){if(t instanceof K)return t;if(yn.call(t,"__wrapped__"))return hn(t)}return new K(t)}E.prototype=D.prototype,E.prototype.constructor=E;var gn=E;function dn(t){var r=ln(t),n=gn[r];if(typeof n!="function"||!(r in G.prototype))return!1;if(t===n)return!0;var e=ct(n);return!!e&&t===e[0]}var bn=dn,wn=800,mn=16,jn=Date.now;function On(t){var r=0,n=0;return function(){var e=jn(),o=mn-(e-n);if(n=e,o>0){if(++r>=wn)return arguments[0]}else r=0;return t.apply(void 0,arguments)}}var pt=On,Sn=pt(at),st=Sn,An=/\\{\\n\\/\\* \\[wrapped with (.+)\\] \\*/,xn=/,? & /;function $n(t){var r=t.match(An);return r?r[1].split(xn):[]}var Pn=$n,Mn=/\\{(?:\\n\\/\\* \\[wrapped with .+\\] \\*\\/)?\\n?/;function Fn(t,r){var n=r.length;if(!n)return t;var e=n-1;return r[e]=(n>1?"& ":"")+r[e],r=r.join(n>2?", ":" "),t.replace(Mn,"{\\n/* [wrapped with "+r+"] */\\n")}var En=Fn;function Rn(t){return function(){return t}}var Tn=Rn,kn=function(){try{var t=et(Object,"defineProperty");return t({},"",{}),t}catch(r){}}(),ht=kn,Cn=ht?function(t,r){return ht(t,"toString",{configurable:!0,enumerable:!1,value:Tn(r),writable:!0})}:k,In=Cn,Wn=pt(In),_t=Wn;function Dn(t,r){for(var n=-1,e=t==null?0:t.length;++n<e&&r(t[n],n,t)!==!1;);return t}var Gn=Dn;function Kn(t,r,n,e){for(var o=t.length,a=n+(e?1:-1);e?a--:++a<o;)if(r(t[a],a,t))return a;return-1}var Nn=Kn;function Un(t){return t!==t}var qn=Un;function zn(t,r,n){for(var e=n-1,o=t.length;++e<o;)if(t[e]===r)return e;return-1}var Bn=zn;function Hn(t,r,n){return r===r?Bn(t,r,n):Nn(t,qn,n)}var Jn=Hn;function Ln(t,r){var n=t==null?0:t.length;return!!n&&Jn(t,r,0)>-1}var Qn=Ln,Vn=1,Xn=2,Yn=8,Zn=16,te=32,re=64,ne=128,ee=256,oe=512,ae=[["ary",ne],["bind",Vn],["bindKey",Xn],["curry",Yn],["curryRight",Zn],["flip",oe],["partial",te],["partialRight",re],["rearg",ee]];function ue(t,r){return Gn(ae,function(n){var e="_."+n[0];r&n[1]&&!Qn(t,e)&&t.push(e)}),t.sort()}var ie=ue;function ve(t,r,n){var e=r+"";return _t(t,En(e,ie(Pn(e),n)))}var yt=ve,ce=1,fe=2,le=4,pe=8,gt=32,dt=64;function se(t,r,n,e,o,a,i,u,v,f){var c=r&pe,p=c?i:void 0,h=c?void 0:i,l=c?a:void 0,g=c?void 0:a;r|=c?gt:dt,r&=~(c?dt:gt),r&le||(r&=~(ce|fe));var j=[t,r,o,l,p,g,h,u,v,f],d=n.apply(void 0,j);return bn(t)&&st(d,j),d.placeholder=e,yt(d,t,r)}var bt=se;function he(t){var r=t;return r.placeholder}var N=he,_e=9007199254740991,ye=/^(?:0|[1-9]\\d*)$/;function ge(t,r){var n,e=_(t);return r=(n=r)!==null&&n!==void 0?n:_e,!!r&&(e=="number"||e!="symbol"&&ye.test(t))&&t>-1&&t%1==0&&t<r}var de=ge,be=Math.min;function we(t,r){for(var n=t.length,e=be(r.length,n),o=lt(t);e--;){var a=r[e];t[e]=de(a,n)?o[a]:void 0}return t}var me=we,wt="__lodash_placeholder__";function je(t,r){for(var n=-1,e=t.length,o=0,a=[];++n<e;){var i=t[n];(i===r||i===wt)&&(t[n]=wt,a[o++]=n)}return a}var A=je,Oe=1,Se=2,Ae=8,xe=16,$e=128,Pe=512;function mt(t,r,n,e,o,a,i,u,v,f){var c=r&$e,p=r&Oe,h=r&Se,l=r&(Ae|xe),g=r&Pe,j=h?void 0:S(t);function d(){for(var b=arguments.length,s=Array(b),J=b;J--;)s[J]=arguments[J];if(l)var Ft=N(d),Xe=tn(s,Ft);if(e&&(s=it(s,e,o,l)),a&&(s=vt(s,a,i,l)),b-=Xe,l&&b<f){var Ye=A(s,Ft);return bt(t,r,mt,d.placeholder,n,s,Ye,u,v,f-b)}var Et=p?n:this,L=h?Et[t]:t;return b=s.length,u?s=me(s,u):g&&b>1&&s.reverse(),c&&v<b&&(s.length=v),this&&this!==w&&this instanceof d&&(L=j||S(L)),L.apply(Et,s)}return d}var jt=mt;function Me(t,r,n){var e=S(t);function o(){for(var a=arguments.length,i=Array(a),u=a,v=N(o);u--;)i[u]=arguments[u];var f=a<3&&i[0]!==v&&i[a-1]!==v?[]:A(i,v);if(a-=f.length,a<n)return bt(t,r,jt,o.placeholder,void 0,i,f,void 0,void 0,n-a);var c=this&&this!==w&&this instanceof o?e:t;return W(c,this,i)}return o}var Fe=Me,Ee=1;function Re(t,r,n,e){var o=r&Ee,a=S(t);function i(){for(var u=-1,v=arguments.length,f=-1,c=e.length,p=Array(c+v),h=this&&this!==w&&this instanceof i?a:t;++f<c;)p[f]=e[f];for(;v--;)p[f++]=arguments[++u];return W(h,o?n:this,p)}return i}var Te=Re,Ot="__lodash_placeholder__",U=1,ke=2,Ce=4,St=8,x=128,At=256,Ie=Math.min;function We(t,r){var n=t[1],e=r[1],o=n|e,a=o<(U|ke|x),i=e==x&&n==St||e==x&&n==At&&t[7].length<=r[8]||e==(x|At)&&r[7].length<=r[8]&&n==St;if(!(a||i))return t;e&U&&(t[2]=r[2],o|=n&U?0:Ce);var u=r[3];if(u){var v=t[3];t[3]=v?it(v,u,r[4]):u,t[4]=v?A(t[3],Ot):r[4]}return u=r[5],u&&(v=t[5],t[5]=v?vt(v,u,r[6]):u,t[6]=v?A(t[5],Ot):r[6]),u=r[7],u&&(t[7]=u),e&x&&(t[8]=t[8]==null?r[8]:Ie(t[8],r[8])),t[9]==null&&(t[9]=r[9]),t[0]=r[0],t[1]=o,t}var De=We,Ge="Expected a function",xt=1,Ke=2,q=8,z=16,B=32,$t=64,Pt=Math.max;function Ne(t,r,n,e,o,a,i,u){var v=r&Ke;if(!v&&typeof t!="function")throw new TypeError(Ge);var f=e?e.length:0;if(f||(r&=~(B|$t),e=o=void 0),i=i===void 0?i:Pt(rt(i),0),u=u===void 0?u:rt(u),f-=o?o.length:0,r&$t){var c=e,p=o;e=o=void 0}var h=v?void 0:ct(t),l=[t,r,n,e,o,c,p,a,i,u];if(h&&De(l,h),t=l[0],r=l[1],n=l[2],e=l[3],o=l[4],u=l[9]=l[9]===void 0?v?0:t.length:Pt(l[9]-f,0),!u&&r&(q|z)&&(r&=~(q|z)),!r||r==xt)var g=Jr(t,r,n);else r==q||r==z?g=Fe(t,r,u):(r==B||r==(xt|B))&&!o.length?g=Te(t,r,n,e):g=jt.apply(void 0,l);var j=h?at:st;return yt(j(g,l),t,r)}var Ue=Ne,Mt=Math.max;function qe(t,r,n){return r=Mt(r===void 0?t.length-1:r,0),function(){for(var e=arguments,o=-1,a=Mt(e.length-r,0),i=Array(a);++o<a;)i[o]=e[r+o];o=-1;for(var u=Array(r+1);++o<r;)u[o]=e[o];return u[r]=n(i),W(t,this,u)}}var ze=qe;function Be(t,r){return _t(ze(t,r,k),t+"")}var He=Be,Je=32,H=He(function(t,r){var n=A(r,N(H));return Ue(t,Je,void 0,r,n)});H.placeholder={};var Le=H;function Qe(t,r){var n=t+" "+r;return console.log(n),n}var Ve=Le(Qe,"hello");Ve("World")})();})();\n</script>\n</body>\n</html>\n').end(done);
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
			this.request.expect('<!DOCTYPE html>\n<html lang="en" class="">\n<head>\n\t<meta charset="utf-8" />\n\t<meta http-equiv="X-UA-Compatible" content="IE=Edge" />\n\t<title>o-test-component: test-demo demo</title>\n\t<meta name="viewport" content="initial-scale=1.0, width=device-width" />\n\t<style>\n\t\tbody {\n\t\t\tmargin: 0;\n\t\t}\n\t</style>\n\n\t\t<script src="https://polyfill.io/v3/polyfill.min.js?features=CustomEvent&flags=gated&unknown=polyfill"></script>\n\n\n\n\n\t\t<style>.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:\'Hello employee 317. Hope you find this internal tool or product helpful. The square root of 64 is "8".\'}\n</style>\n</head>\n<body>\n\t<div data-o-component="o-test-component" class="o-test-component">\n\t</div>\n\t<script src="https://registry.origami.ft.com/embedapi?autoload=resize"></script>\n\t\t<script>(function(){"use strict";function _(R){return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?_=function(y){return typeof y}:_=function(y){return y&&typeof Symbol=="function"&&y.constructor===Symbol&&y!==Symbol.prototype?"symbol":typeof y},_(R)}(function(){var R=(typeof global=="undefined"?"undefined":_(global))=="object"&&global&&global.Object===Object&&global,T=R,y=(typeof self=="undefined"?"undefined":_(self))=="object"&&self&&self.Object===Object&&self,Rt=T||y||Function("return this")(),w=Rt,Tt=w.Symbol,$=Tt,Q=Object.prototype,kt=Q.hasOwnProperty,Ct=Q.toString,O=$?$.toStringTag:void 0;function It(t){var r=kt.call(t,O),n=t[O];try{t[O]=void 0;var e=!0}catch(a){}var o=Ct.call(t);return e&&(r?t[O]=n:delete t[O]),o}var Wt=It,Dt=Object.prototype,Gt=Dt.toString;function Kt(t){return Gt.call(t)}var Nt=Kt,Ut="[object Null]",qt="[object Undefined]",V=$?$.toStringTag:void 0;function zt(t){return t==null?t===void 0?qt:Ut:V&&V in Object(t)?Wt(t):Nt(t)}var X=zt;function Bt(t){return t!=null&&_(t)=="object"}var Y=Bt,Ht="[object Symbol]";function Jt(t){return _(t)=="symbol"||Y(t)&&X(t)==Ht}var Lt=Jt,Qt=Array.isArray,Vt=Qt,Xt=/\\s/;function Yt(t){for(var r=t.length;r--&&Xt.test(t.charAt(r)););return r}var Zt=Yt,tr=/^\\s+/;function rr(t){return t&&t.slice(0,Zt(t)+1).replace(tr,"")}var nr=rr;function er(t){var r=_(t);return t!=null&&(r=="object"||r=="function")}var m=er,Z=0/0,or=/^[-+]0x[0-9a-f]+$/i,ar=/^0b[01]+$/i,ur=/^0o[0-7]+$/i,ir=parseInt;function vr(t){if(typeof t=="number")return t;if(Lt(t))return Z;if(m(t)){var r=typeof t.valueOf=="function"?t.valueOf():t;t=m(r)?r+"":r}if(typeof t!="string")return t===0?t:+t;t=nr(t);var n=ar.test(t);return n||ur.test(t)?ir(t.slice(2),n?2:8):or.test(t)?Z:+t}var cr=vr,tt=1/0,fr=17976931348623157e292;function lr(t){if(!t)return t===0?t:0;if(t=cr(t),t===tt||t===-tt){var r=t<0?-1:1;return r*fr}return t===t?t:0}var pr=lr;function sr(t){var r=pr(t),n=r%1;return r===r?n?r-n:r:0}var rt=sr;function hr(t){return t}var k=hr,_r="[object AsyncFunction]",yr="[object Function]",gr="[object GeneratorFunction]",dr="[object Proxy]";function br(t){if(!m(t))return!1;var r=X(t);return r==yr||r==gr||r==_r||r==dr}var wr=br,mr=w["__core-js_shared__"],C=mr,nt=function(){var t=/[^.]+$/.exec(C&&C.keys&&C.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}();function jr(t){return!!nt&&nt in t}var Or=jr,Sr=Function.prototype,Ar=Sr.toString;function xr(t){if(t!=null){try{return Ar.call(t)}catch(r){}try{return t+""}catch(r){}}return""}var $r=xr,Pr=/[\\\\^$.*+?()[\\]{}|]/g,Mr=/^\\[object .+?Constructor\\]$/,Fr=Function.prototype,Er=Object.prototype,Rr=Fr.toString,Tr=Er.hasOwnProperty,kr=RegExp("^"+Rr.call(Tr).replace(Pr,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$");function Cr(t){if(!m(t)||Or(t))return!1;var r=wr(t)?kr:Mr;return r.test($r(t))}var Ir=Cr;function Wr(t,r){return t==null?void 0:t[r]}var Dr=Wr;function Gr(t,r){var n=Dr(t,r);return Ir(n)?n:void 0}var et=Gr,Kr=et(w,"WeakMap"),ot=Kr,Nr=ot&&new ot,P=Nr,Ur=P?function(t,r){return P.set(t,r),t}:k,at=Ur,ut=Object.create,qr=function(){function t(){}return function(r){if(!m(r))return{};if(ut)return ut(r);t.prototype=r;var n=new t;return t.prototype=void 0,n}}(),I=qr;function zr(t){return function(){var r=arguments;switch(r.length){case 0:return new t;case 1:return new t(r[0]);case 2:return new t(r[0],r[1]);case 3:return new t(r[0],r[1],r[2]);case 4:return new t(r[0],r[1],r[2],r[3]);case 5:return new t(r[0],r[1],r[2],r[3],r[4]);case 6:return new t(r[0],r[1],r[2],r[3],r[4],r[5]);case 7:return new t(r[0],r[1],r[2],r[3],r[4],r[5],r[6])}var n=I(t.prototype),e=t.apply(n,r);return m(e)?e:n}}var S=zr,Br=1;function Hr(t,r,n){var e=r&Br,o=S(t);function a(){var i=this&&this!==w&&this instanceof a?o:t;return i.apply(e?n:this,arguments)}return a}var Jr=Hr;function Lr(t,r,n){switch(n.length){case 0:return t.call(r);case 1:return t.call(r,n[0]);case 2:return t.call(r,n[0],n[1]);case 3:return t.call(r,n[0],n[1],n[2])}return t.apply(r,n)}var W=Lr,Qr=Math.max;function Vr(t,r,n,e){for(var o=-1,a=t.length,i=n.length,u=-1,v=r.length,f=Qr(a-i,0),c=Array(v+f),p=!e;++u<v;)c[u]=r[u];for(;++o<i;)(p||o<a)&&(c[n[o]]=t[o]);for(;f--;)c[u++]=t[o++];return c}var it=Vr,Xr=Math.max;function Yr(t,r,n,e){for(var o=-1,a=t.length,i=-1,u=n.length,v=-1,f=r.length,c=Xr(a-u,0),p=Array(c+f),h=!e;++o<c;)p[o]=t[o];for(var l=o;++v<f;)p[l+v]=r[v];for(;++i<u;)(h||o<a)&&(p[l+n[i]]=t[o++]);return p}var vt=Yr;function Zr(t,r){for(var n=t.length,e=0;n--;)t[n]===r&&++e;return e}var tn=Zr;function rn(){}var D=rn,nn=4294967295;function M(t){this.__wrapped__=t,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=nn,this.__views__=[]}M.prototype=I(D.prototype),M.prototype.constructor=M;var G=M;function en(){}var on=en,an=P?function(t){return P.get(t)}:on,ct=an,un={},ft=un,vn=Object.prototype,cn=vn.hasOwnProperty;function fn(t){for(var r=t.name+"",n=ft[r],e=cn.call(ft,r)?n.length:0;e--;){var o=n[e],a=o.func;if(a==null||a==t)return o.name}return r}var ln=fn;function F(t,r){this.__wrapped__=t,this.__actions__=[],this.__chain__=!!r,this.__index__=0,this.__values__=void 0}F.prototype=I(D.prototype),F.prototype.constructor=F;var K=F;function pn(t,r){var n=-1,e=t.length;for(r||(r=Array(e));++n<e;)r[n]=t[n];return r}var lt=pn;function sn(t){if(t instanceof G)return t.clone();var r=new K(t.__wrapped__,t.__chain__);return r.__actions__=lt(t.__actions__),r.__index__=t.__index__,r.__values__=t.__values__,r}var hn=sn,_n=Object.prototype,yn=_n.hasOwnProperty;function E(t){if(Y(t)&&!Vt(t)&&!(t instanceof G)){if(t instanceof K)return t;if(yn.call(t,"__wrapped__"))return hn(t)}return new K(t)}E.prototype=D.prototype,E.prototype.constructor=E;var gn=E;function dn(t){var r=ln(t),n=gn[r];if(typeof n!="function"||!(r in G.prototype))return!1;if(t===n)return!0;var e=ct(n);return!!e&&t===e[0]}var bn=dn,wn=800,mn=16,jn=Date.now;function On(t){var r=0,n=0;return function(){var e=jn(),o=mn-(e-n);if(n=e,o>0){if(++r>=wn)return arguments[0]}else r=0;return t.apply(void 0,arguments)}}var pt=On,Sn=pt(at),st=Sn,An=/\\{\\n\\/\\* \\[wrapped with (.+)\\] \\*/,xn=/,? & /;function $n(t){var r=t.match(An);return r?r[1].split(xn):[]}var Pn=$n,Mn=/\\{(?:\\n\\/\\* \\[wrapped with .+\\] \\*\\/)?\\n?/;function Fn(t,r){var n=r.length;if(!n)return t;var e=n-1;return r[e]=(n>1?"& ":"")+r[e],r=r.join(n>2?", ":" "),t.replace(Mn,"{\\n/* [wrapped with "+r+"] */\\n")}var En=Fn;function Rn(t){return function(){return t}}var Tn=Rn,kn=function(){try{var t=et(Object,"defineProperty");return t({},"",{}),t}catch(r){}}(),ht=kn,Cn=ht?function(t,r){return ht(t,"toString",{configurable:!0,enumerable:!1,value:Tn(r),writable:!0})}:k,In=Cn,Wn=pt(In),_t=Wn;function Dn(t,r){for(var n=-1,e=t==null?0:t.length;++n<e&&r(t[n],n,t)!==!1;);return t}var Gn=Dn;function Kn(t,r,n,e){for(var o=t.length,a=n+(e?1:-1);e?a--:++a<o;)if(r(t[a],a,t))return a;return-1}var Nn=Kn;function Un(t){return t!==t}var qn=Un;function zn(t,r,n){for(var e=n-1,o=t.length;++e<o;)if(t[e]===r)return e;return-1}var Bn=zn;function Hn(t,r,n){return r===r?Bn(t,r,n):Nn(t,qn,n)}var Jn=Hn;function Ln(t,r){var n=t==null?0:t.length;return!!n&&Jn(t,r,0)>-1}var Qn=Ln,Vn=1,Xn=2,Yn=8,Zn=16,te=32,re=64,ne=128,ee=256,oe=512,ae=[["ary",ne],["bind",Vn],["bindKey",Xn],["curry",Yn],["curryRight",Zn],["flip",oe],["partial",te],["partialRight",re],["rearg",ee]];function ue(t,r){return Gn(ae,function(n){var e="_."+n[0];r&n[1]&&!Qn(t,e)&&t.push(e)}),t.sort()}var ie=ue;function ve(t,r,n){var e=r+"";return _t(t,En(e,ie(Pn(e),n)))}var yt=ve,ce=1,fe=2,le=4,pe=8,gt=32,dt=64;function se(t,r,n,e,o,a,i,u,v,f){var c=r&pe,p=c?i:void 0,h=c?void 0:i,l=c?a:void 0,g=c?void 0:a;r|=c?gt:dt,r&=~(c?dt:gt),r&le||(r&=~(ce|fe));var j=[t,r,o,l,p,g,h,u,v,f],d=n.apply(void 0,j);return bn(t)&&st(d,j),d.placeholder=e,yt(d,t,r)}var bt=se;function he(t){var r=t;return r.placeholder}var N=he,_e=9007199254740991,ye=/^(?:0|[1-9]\\d*)$/;function ge(t,r){var n,e=_(t);return r=(n=r)!==null&&n!==void 0?n:_e,!!r&&(e=="number"||e!="symbol"&&ye.test(t))&&t>-1&&t%1==0&&t<r}var de=ge,be=Math.min;function we(t,r){for(var n=t.length,e=be(r.length,n),o=lt(t);e--;){var a=r[e];t[e]=de(a,n)?o[a]:void 0}return t}var me=we,wt="__lodash_placeholder__";function je(t,r){for(var n=-1,e=t.length,o=0,a=[];++n<e;){var i=t[n];(i===r||i===wt)&&(t[n]=wt,a[o++]=n)}return a}var A=je,Oe=1,Se=2,Ae=8,xe=16,$e=128,Pe=512;function mt(t,r,n,e,o,a,i,u,v,f){var c=r&$e,p=r&Oe,h=r&Se,l=r&(Ae|xe),g=r&Pe,j=h?void 0:S(t);function d(){for(var b=arguments.length,s=Array(b),J=b;J--;)s[J]=arguments[J];if(l)var Ft=N(d),Xe=tn(s,Ft);if(e&&(s=it(s,e,o,l)),a&&(s=vt(s,a,i,l)),b-=Xe,l&&b<f){var Ye=A(s,Ft);return bt(t,r,mt,d.placeholder,n,s,Ye,u,v,f-b)}var Et=p?n:this,L=h?Et[t]:t;return b=s.length,u?s=me(s,u):g&&b>1&&s.reverse(),c&&v<b&&(s.length=v),this&&this!==w&&this instanceof d&&(L=j||S(L)),L.apply(Et,s)}return d}var jt=mt;function Me(t,r,n){var e=S(t);function o(){for(var a=arguments.length,i=Array(a),u=a,v=N(o);u--;)i[u]=arguments[u];var f=a<3&&i[0]!==v&&i[a-1]!==v?[]:A(i,v);if(a-=f.length,a<n)return bt(t,r,jt,o.placeholder,void 0,i,f,void 0,void 0,n-a);var c=this&&this!==w&&this instanceof o?e:t;return W(c,this,i)}return o}var Fe=Me,Ee=1;function Re(t,r,n,e){var o=r&Ee,a=S(t);function i(){for(var u=-1,v=arguments.length,f=-1,c=e.length,p=Array(c+v),h=this&&this!==w&&this instanceof i?a:t;++f<c;)p[f]=e[f];for(;v--;)p[f++]=arguments[++u];return W(h,o?n:this,p)}return i}var Te=Re,Ot="__lodash_placeholder__",U=1,ke=2,Ce=4,St=8,x=128,At=256,Ie=Math.min;function We(t,r){var n=t[1],e=r[1],o=n|e,a=o<(U|ke|x),i=e==x&&n==St||e==x&&n==At&&t[7].length<=r[8]||e==(x|At)&&r[7].length<=r[8]&&n==St;if(!(a||i))return t;e&U&&(t[2]=r[2],o|=n&U?0:Ce);var u=r[3];if(u){var v=t[3];t[3]=v?it(v,u,r[4]):u,t[4]=v?A(t[3],Ot):r[4]}return u=r[5],u&&(v=t[5],t[5]=v?vt(v,u,r[6]):u,t[6]=v?A(t[5],Ot):r[6]),u=r[7],u&&(t[7]=u),e&x&&(t[8]=t[8]==null?r[8]:Ie(t[8],r[8])),t[9]==null&&(t[9]=r[9]),t[0]=r[0],t[1]=o,t}var De=We,Ge="Expected a function",xt=1,Ke=2,q=8,z=16,B=32,$t=64,Pt=Math.max;function Ne(t,r,n,e,o,a,i,u){var v=r&Ke;if(!v&&typeof t!="function")throw new TypeError(Ge);var f=e?e.length:0;if(f||(r&=~(B|$t),e=o=void 0),i=i===void 0?i:Pt(rt(i),0),u=u===void 0?u:rt(u),f-=o?o.length:0,r&$t){var c=e,p=o;e=o=void 0}var h=v?void 0:ct(t),l=[t,r,n,e,o,c,p,a,i,u];if(h&&De(l,h),t=l[0],r=l[1],n=l[2],e=l[3],o=l[4],u=l[9]=l[9]===void 0?v?0:t.length:Pt(l[9]-f,0),!u&&r&(q|z)&&(r&=~(q|z)),!r||r==xt)var g=Jr(t,r,n);else r==q||r==z?g=Fe(t,r,u):(r==B||r==(xt|B))&&!o.length?g=Te(t,r,n,e):g=jt.apply(void 0,l);var j=h?at:st;return yt(j(g,l),t,r)}var Ue=Ne,Mt=Math.max;function qe(t,r,n){return r=Mt(r===void 0?t.length-1:r,0),function(){for(var e=arguments,o=-1,a=Mt(e.length-r,0),i=Array(a);++o<a;)i[o]=e[r+o];o=-1;for(var u=Array(r+1);++o<r;)u[o]=e[o];return u[r]=n(i),W(t,this,u)}}var ze=qe;function Be(t,r){return _t(ze(t,r,k),t+"")}var He=Be,Je=32,H=He(function(t,r){var n=A(r,N(H));return Ue(t,Je,void 0,r,n)});H.placeholder={};var Le=H;function Qe(t,r){var n=t+" "+r;return console.log(n),n}var Ve=Le(Qe,"hello");Ve("World")})();})();\n</script>\n</body>\n</html>\n').end(done);
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

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
            it('should respond with the expected `Content-Type` header', function(done) {
                this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
            });

            it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
                this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
            });
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

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
            it('should respond with the expected `Content-Type` header', function(done) {
                this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
            });

            it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
                this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
            });
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

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
            it('should respond with the expected `Content-Type` header', function(done) {
                this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
            });

            it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
                this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
            });
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
