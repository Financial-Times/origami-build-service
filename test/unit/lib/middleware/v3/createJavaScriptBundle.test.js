/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const getEcmaVersion = require('detect-es-version').getEcmaVersion;
const vm = require('vm');
const sinon = require('sinon');
const httpMock = require('node-mocks-http');

describe('createJavaScriptBundle', function () {
	this.timeout(10 * 1000);
	let createJavaScriptBundle;

	beforeEach(function () {
		createJavaScriptBundle = require('../../../../../lib/middleware/v3/createJavaScriptBundle')
			.createJavaScriptBundle;
	});

	it('it is a function', async () => {
		proclaim.isFunction(createJavaScriptBundle);
	});

	context('when given a valid request', function () {

		context('and the response takes more than 25 seconds to be generated', function () {
			this.timeout(30000);

			let fakeNpmRegistryAddress;
			let fakeNpmRegistry;
			beforeEach(function() {
				fakeNpmRegistry = require('express')().use(() => {}).listen(0);
				fakeNpmRegistryAddress = `http://localhost:${fakeNpmRegistry.address().port}`;
			});

			afterEach( function() {
				fakeNpmRegistry.close();
			});

			it('it responds with a redirect back to the same location', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: fakeNpmRegistryAddress
						}
					}
				};
				request.basePath = '/';
				request.path = '/v3/bundles/js';
				request.query.components = 'o-test-component@2.2.9';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				proclaim.deepStrictEqual(response.statusCode, 307);
				proclaim.deepStrictEqual(
					response.getHeader('location'),
					'/v3/bundles/js?components=o-test-component%402.2.9&system_code=origami'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'private, no-store'
				);

			});
		});

		it('it responds with a javascript bundle which contains the requested component', async () => {
			const request = httpMock.createRequest();
			const response = httpMock.createResponse();
			response.startTime = sinon.spy();
			response.endTime = sinon.spy();
			request.app = {
				ft: {
					options: {
						npmRegistryURL: 'https://registry.npmjs.org'
					}
				}
			};
			request.query.components = 'o-test-component@2.2.9';
			request.query.system_code = 'origami';

			await createJavaScriptBundle(request, response);

			const bundle = response._getData();

			proclaim.deepStrictEqual(
				bundle,
				'(function(){"use strict";function _(R){return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?_=function(y){return typeof y}:_=function(y){return y&&typeof Symbol=="function"&&y.constructor===Symbol&&y!==Symbol.prototype?"symbol":typeof y},_(R)}(function(){var R={},T=(typeof global=="undefined"?"undefined":_(global))=="object"&&global&&global.Object===Object&&global,y=T,Rr=(typeof self=="undefined"?"undefined":_(self))=="object"&&self&&self.Object===Object&&self,Tr=y||Rr||Function("return this")(),m=Tr,kr=m.Symbol,$=kr,Q=Object.prototype,Cr=Q.hasOwnProperty,Ir=Q.toString,j=$?$.toStringTag:void 0;function Wr(r){var t=Cr.call(r,j),n=r[j];try{r[j]=void 0;var o=!0}catch(e){}var a=Ir.call(r);return o&&(t?r[j]=n:delete r[j]),a}var Dr=Wr,Gr=Object.prototype,Kr=Gr.toString;function Nr(r){return Kr.call(r)}var Ur=Nr,qr="[object Null]",zr="[object Undefined]",V=$?$.toStringTag:void 0;function Br(r){return r==null?r===void 0?zr:qr:V&&V in Object(r)?Dr(r):Ur(r)}var X=Br;function Hr(r){return r!=null&&_(r)=="object"}var Y=Hr,Jr="[object Symbol]";function Lr(r){return _(r)=="symbol"||Y(r)&&X(r)==Jr}var Qr=Lr,Vr=Array.isArray,Xr=Vr,Yr=/\\s/;function Zr(r){for(var t=r.length;t--&&Yr.test(r.charAt(t)););return t}var rt=Zr,tt=/^\\s+/;function nt(r){return r&&r.slice(0,rt(r)+1).replace(tt,"")}var ot=nt;function at(r){var t=_(r);return r!=null&&(t=="object"||t=="function")}var w=at,Z=0/0,et=/^[-+]0x[0-9a-f]+$/i,ut=/^0b[01]+$/i,it=/^0o[0-7]+$/i,vt=parseInt;function ct(r){if(typeof r=="number")return r;if(Qr(r))return Z;if(w(r)){var t=typeof r.valueOf=="function"?r.valueOf():r;r=w(t)?t+"":t}if(typeof r!="string")return r===0?r:+r;r=ot(r);var n=ut.test(r);return n||it.test(r)?vt(r.slice(2),n?2:8):et.test(r)?Z:+r}var ft=ct,rr=1/0,lt=17976931348623157e292;function st(r){if(!r)return r===0?r:0;if(r=ft(r),r===rr||r===-rr){var t=r<0?-1:1;return t*lt}return r===r?r:0}var pt=st;function ht(r){var t=pt(r),n=t%1;return t===t?n?t-n:t:0}var tr=ht;function _t(r){return r}var k=_t,yt="[object AsyncFunction]",gt="[object Function]",dt="[object GeneratorFunction]",bt="[object Proxy]";function mt(r){if(!w(r))return!1;var t=X(r);return t==gt||t==dt||t==yt||t==bt}var wt=mt,Ot=m["__core-js_shared__"],C=Ot,nr=function(){var r=/[^.]+$/.exec(C&&C.keys&&C.keys.IE_PROTO||"");return r?"Symbol(src)_1."+r:""}();function jt(r){return!!nr&&nr in r}var St=jt,At=Function.prototype,xt=At.toString;function $t(r){if(r!=null){try{return xt.call(r)}catch(t){}try{return r+""}catch(t){}}return""}var Pt=$t,Mt=/[\\\\^$.*+?()[\\]{}|]/g,Ft=/^\\[object .+?Constructor\\]$/,Et=Function.prototype,Rt=Object.prototype,Tt=Et.toString,kt=Rt.hasOwnProperty,Ct=RegExp("^"+Tt.call(kt).replace(Mt,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$");function It(r){if(!w(r)||St(r))return!1;var t=wt(r)?Ct:Ft;return t.test(Pt(r))}var Wt=It;function Dt(r,t){return r==null?void 0:r[t]}var Gt=Dt;function Kt(r,t){var n=Gt(r,t);return Wt(n)?n:void 0}var or=Kt,Nt=or(m,"WeakMap"),ar=Nt,Ut=ar&&new ar,P=Ut,qt=P?function(r,t){return P.set(r,t),r}:k,er=qt,ur=Object.create,zt=function(){function r(){}return function(t){if(!w(t))return{};if(ur)return ur(t);r.prototype=t;var n=new r;return r.prototype=void 0,n}}(),I=zt;function Bt(r){return function(){var t=arguments;switch(t.length){case 0:return new r;case 1:return new r(t[0]);case 2:return new r(t[0],t[1]);case 3:return new r(t[0],t[1],t[2]);case 4:return new r(t[0],t[1],t[2],t[3]);case 5:return new r(t[0],t[1],t[2],t[3],t[4]);case 6:return new r(t[0],t[1],t[2],t[3],t[4],t[5]);case 7:return new r(t[0],t[1],t[2],t[3],t[4],t[5],t[6])}var n=I(r.prototype),o=r.apply(n,t);return w(o)?o:n}}var S=Bt,Ht=1;function Jt(r,t,n){var o=t&Ht,a=S(r);function e(){var i=this&&this!==m&&this instanceof e?a:r;return i.apply(o?n:this,arguments)}return e}var Lt=Jt;function Qt(r,t,n){switch(n.length){case 0:return r.call(t);case 1:return r.call(t,n[0]);case 2:return r.call(t,n[0],n[1]);case 3:return r.call(t,n[0],n[1],n[2])}return r.apply(t,n)}var W=Qt,Vt=Math.max;function Xt(r,t,n,o){for(var a=-1,e=r.length,i=n.length,u=-1,v=t.length,f=Vt(e-i,0),c=Array(v+f),s=!o;++u<v;)c[u]=t[u];for(;++a<i;)(s||a<e)&&(c[n[a]]=r[a]);for(;f--;)c[u++]=r[a++];return c}var ir=Xt,Yt=Math.max;function Zt(r,t,n,o){for(var a=-1,e=r.length,i=-1,u=n.length,v=-1,f=t.length,c=Yt(e-u,0),s=Array(c+f),h=!o;++a<c;)s[a]=r[a];for(var l=a;++v<f;)s[l+v]=t[v];for(;++i<u;)(h||a<e)&&(s[l+n[i]]=r[a++]);return s}var vr=Zt;function rn(r,t){for(var n=r.length,o=0;n--;)r[n]===t&&++o;return o}var tn=rn;function nn(){}var D=nn,on=4294967295;function M(r){this.__wrapped__=r,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=on,this.__views__=[]}M.prototype=I(D.prototype),M.prototype.constructor=M;var G=M;function an(){}var en=an,un=P?function(r){return P.get(r)}:en,cr=un,vn={},fr=vn,cn=Object.prototype,fn=cn.hasOwnProperty;function ln(r){for(var t=r.name+"",n=fr[t],o=fn.call(fr,t)?n.length:0;o--;){var a=n[o],e=a.func;if(e==null||e==r)return a.name}return t}var sn=ln;function F(r,t){this.__wrapped__=r,this.__actions__=[],this.__chain__=!!t,this.__index__=0,this.__values__=void 0}F.prototype=I(D.prototype),F.prototype.constructor=F;var K=F;function pn(r,t){var n=-1,o=r.length;for(t||(t=Array(o));++n<o;)t[n]=r[n];return t}var lr=pn;function hn(r){if(r instanceof G)return r.clone();var t=new K(r.__wrapped__,r.__chain__);return t.__actions__=lr(r.__actions__),t.__index__=r.__index__,t.__values__=r.__values__,t}var _n=hn,yn=Object.prototype,gn=yn.hasOwnProperty;function E(r){if(Y(r)&&!Xr(r)&&!(r instanceof G)){if(r instanceof K)return r;if(gn.call(r,"__wrapped__"))return _n(r)}return new K(r)}E.prototype=D.prototype,E.prototype.constructor=E;var dn=E;function bn(r){var t=sn(r),n=dn[t];if(typeof n!="function"||!(t in G.prototype))return!1;if(r===n)return!0;var o=cr(n);return!!o&&r===o[0]}var mn=bn,wn=800,On=16,jn=Date.now;function Sn(r){var t=0,n=0;return function(){var o=jn(),a=On-(o-n);if(n=o,a>0){if(++t>=wn)return arguments[0]}else t=0;return r.apply(void 0,arguments)}}var sr=Sn,An=sr(er),pr=An,xn=/\\{\\n\\/\\* \\[wrapped with (.+)\\] \\*/,$n=/,? & /;function Pn(r){var t=r.match(xn);return t?t[1].split($n):[]}var Mn=Pn,Fn=/\\{(?:\\n\\/\\* \\[wrapped with .+\\] \\*\\/)?\\n?/;function En(r,t){var n=t.length;if(!n)return r;var o=n-1;return t[o]=(n>1?"& ":"")+t[o],t=t.join(n>2?", ":" "),r.replace(Fn,"{\\n/* [wrapped with "+t+"] */\\n")}var Rn=En;function Tn(r){return function(){return r}}var kn=Tn,Cn=function(){try{var r=or(Object,"defineProperty");return r({},"",{}),r}catch(t){}}(),hr=Cn,In=hr?function(r,t){return hr(r,"toString",{configurable:!0,enumerable:!1,value:kn(t),writable:!0})}:k,Wn=In,Dn=sr(Wn),_r=Dn;function Gn(r,t){for(var n=-1,o=r==null?0:r.length;++n<o&&t(r[n],n,r)!==!1;);return r}var Kn=Gn;function Nn(r,t,n,o){for(var a=r.length,e=n+(o?1:-1);o?e--:++e<a;)if(t(r[e],e,r))return e;return-1}var Un=Nn;function qn(r){return r!==r}var zn=qn;function Bn(r,t,n){for(var o=n-1,a=r.length;++o<a;)if(r[o]===t)return o;return-1}var Hn=Bn;function Jn(r,t,n){return t===t?Hn(r,t,n):Un(r,zn,n)}var Ln=Jn;function Qn(r,t){var n=r==null?0:r.length;return!!n&&Ln(r,t,0)>-1}var Vn=Qn,Xn=1,Yn=2,Zn=8,ro=16,to=32,no=64,oo=128,ao=256,eo=512,uo=[["ary",oo],["bind",Xn],["bindKey",Yn],["curry",Zn],["curryRight",ro],["flip",eo],["partial",to],["partialRight",no],["rearg",ao]];function io(r,t){return Kn(uo,function(n){var o="_."+n[0];t&n[1]&&!Vn(r,o)&&r.push(o)}),r.sort()}var vo=io;function co(r,t,n){var o=t+"";return _r(r,Rn(o,vo(Mn(o),n)))}var yr=co,fo=1,lo=2,so=4,po=8,gr=32,dr=64;function ho(r,t,n,o,a,e,i,u,v,f){var c=t&po,s=c?i:void 0,h=c?void 0:i,l=c?e:void 0,g=c?void 0:e;t|=c?gr:dr,t&=~(c?dr:gr),t&so||(t&=~(fo|lo));var O=[r,t,a,l,s,g,h,u,v,f],d=n.apply(void 0,O);return mn(r)&&pr(d,O),d.placeholder=o,yr(d,r,t)}var br=ho;function _o(r){var t=r;return t.placeholder}var N=_o,yo=9007199254740991,go=/^(?:0|[1-9]\\d*)$/;function bo(r,t){var n,o=_(r);return t=(n=t)!==null&&n!==void 0?n:yo,!!t&&(o=="number"||o!="symbol"&&go.test(r))&&r>-1&&r%1==0&&r<t}var mo=bo,wo=Math.min;function Oo(r,t){for(var n=r.length,o=wo(t.length,n),a=lr(r);o--;){var e=t[o];r[o]=mo(e,n)?a[e]:void 0}return r}var jo=Oo,mr="__lodash_placeholder__";function So(r,t){for(var n=-1,o=r.length,a=0,e=[];++n<o;){var i=r[n];(i===t||i===mr)&&(r[n]=mr,e[a++]=n)}return e}var A=So,Ao=1,xo=2,$o=8,Po=16,Mo=128,Fo=512;function wr(r,t,n,o,a,e,i,u,v,f){var c=t&Mo,s=t&Ao,h=t&xo,l=t&($o|Po),g=t&Fo,O=h?void 0:S(r);function d(){for(var b=arguments.length,p=Array(b),J=b;J--;)p[J]=arguments[J];if(l)var Fr=N(d),Zo=tn(p,Fr);if(o&&(p=ir(p,o,a,l)),e&&(p=vr(p,e,i,l)),b-=Zo,l&&b<f){var ra=A(p,Fr);return br(r,t,wr,d.placeholder,n,p,ra,u,v,f-b)}var Er=s?n:this,L=h?Er[r]:r;return b=p.length,u?p=jo(p,u):g&&b>1&&p.reverse(),c&&v<b&&(p.length=v),this&&this!==m&&this instanceof d&&(L=O||S(L)),L.apply(Er,p)}return d}var Or=wr;function Eo(r,t,n){var o=S(r);function a(){for(var e=arguments.length,i=Array(e),u=e,v=N(a);u--;)i[u]=arguments[u];var f=e<3&&i[0]!==v&&i[e-1]!==v?[]:A(i,v);if(e-=f.length,e<n)return br(r,t,Or,a.placeholder,void 0,i,f,void 0,void 0,n-e);var c=this&&this!==m&&this instanceof a?o:r;return W(c,this,i)}return a}var Ro=Eo,To=1;function ko(r,t,n,o){var a=t&To,e=S(r);function i(){for(var u=-1,v=arguments.length,f=-1,c=o.length,s=Array(c+v),h=this&&this!==m&&this instanceof i?e:r;++f<c;)s[f]=o[f];for(;v--;)s[f++]=arguments[++u];return W(h,a?n:this,s)}return i}var Co=ko,jr="__lodash_placeholder__",U=1,Io=2,Wo=4,Sr=8,x=128,Ar=256,Do=Math.min;function Go(r,t){var n=r[1],o=t[1],a=n|o,e=a<(U|Io|x),i=o==x&&n==Sr||o==x&&n==Ar&&r[7].length<=t[8]||o==(x|Ar)&&t[7].length<=t[8]&&n==Sr;if(!(e||i))return r;o&U&&(r[2]=t[2],a|=n&U?0:Wo);var u=t[3];if(u){var v=r[3];r[3]=v?ir(v,u,t[4]):u,r[4]=v?A(r[3],jr):t[4]}return u=t[5],u&&(v=r[5],r[5]=v?vr(v,u,t[6]):u,r[6]=v?A(r[5],jr):t[6]),u=t[7],u&&(r[7]=u),o&x&&(r[8]=r[8]==null?t[8]:Do(r[8],t[8])),r[9]==null&&(r[9]=t[9]),r[0]=t[0],r[1]=a,r}var Ko=Go,No="Expected a function",xr=1,Uo=2,q=8,z=16,B=32,$r=64,Pr=Math.max;function qo(r,t,n,o,a,e,i,u){var v=t&Uo;if(!v&&typeof r!="function")throw new TypeError(No);var f=o?o.length:0;if(f||(t&=~(B|$r),o=a=void 0),i=i===void 0?i:Pr(tr(i),0),u=u===void 0?u:tr(u),f-=a?a.length:0,t&$r){var c=o,s=a;o=a=void 0}var h=v?void 0:cr(r),l=[r,t,n,o,a,c,s,e,i,u];if(h&&Ko(l,h),r=l[0],t=l[1],n=l[2],o=l[3],a=l[4],u=l[9]=l[9]===void 0?v?0:r.length:Pr(l[9]-f,0),!u&&t&(q|z)&&(t&=~(q|z)),!t||t==xr)var g=Lt(r,t,n);else t==q||t==z?g=Ro(r,t,u):(t==B||t==(xr|B))&&!a.length?g=Co(r,t,n,o):g=Or.apply(void 0,l);var O=h?er:pr;return yr(O(g,l),r,t)}var zo=qo,Mr=Math.max;function Bo(r,t,n){return t=Mr(t===void 0?r.length-1:t,0),function(){for(var o=arguments,a=-1,e=Mr(o.length-t,0),i=Array(e);++a<e;)i[a]=o[t+a];a=-1;for(var u=Array(t+1);++a<t;)u[a]=o[a];return u[t]=n(i),W(r,this,u)}}var Ho=Bo;function Jo(r,t){return _r(Ho(r,t,k),r+"")}var Lo=Jo,Qo=32,H=Lo(function(r,t){var n=A(t,N(H));return zo(r,Qo,void 0,t,n)});H.placeholder={};var Vo=H;function Xo(r,t){var n=r+" "+t;return console.log(n),n}var Yo=Vo(Xo,"hello");Yo("World"),typeof Origami=="undefined"&&(self.Origami={}),self.Origami["o-test-component"]=R})();})();\n'
			);
			proclaim.deepStrictEqual(response.statusCode, 200);
			proclaim.deepStrictEqual(
				response.getHeader('content-type'),
				'application/javascript;charset=UTF-8'
			);
			proclaim.deepStrictEqual(
				response.getHeader('cache-control'),
				'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000'
			);

			proclaim.deepStrictEqual(getEcmaVersion(bundle), 5);

			const script = new vm.Script(bundle);

			const context = {};
			context.self = context;
			script.runInNewContext(context);
			proclaim.isObject(context.Origami);
			proclaim.isObject(context.Origami['o-test-component']);
		});
	});

	context('when given a valid request but the component is origami v1', function () {
		it('it responds with an error message', async () => {
			const request = httpMock.createRequest();
			const response = httpMock.createResponse();
			response.startTime = sinon.spy();
			response.endTime = sinon.spy();
			request.app = {
				ft: {
					options: {
						npmRegistryURL: 'https://registry.npmjs.org'
					}
				}
			};
			request.query.components = 'o-utils@1.1.7';
			request.query.system_code = 'origami';

			await createJavaScriptBundle(request, response);

			const bundle = response._getData();

			proclaim.deepStrictEqual(
				bundle,
				'Origami Build Service returned an error: "o-utils@1.1.7 is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components."'
			);
			proclaim.deepStrictEqual(response.statusCode, 400);
			proclaim.deepStrictEqual(
				response.getHeader('content-type'),
				'text/plain; charset=UTF-8'
			);
			proclaim.deepStrictEqual(
				response.getHeader('cache-control'),
				'max-age=0, must-revalidate, no-cache, no-store'
			);
		});
	});

	context('when given a request with no components parameter', function () {
		it('it responds with a plain text error message', async () => {
			const request = httpMock.createRequest();
			const response = httpMock.createResponse();
			response.startTime = sinon.spy();
			response.endTime = sinon.spy();
			request.app = {
				ft: {
					options: {
						npmRegistryURL: 'https://registry.npmjs.org'
					}
				}
			};
			request.query.system_code = 'origami';

			await createJavaScriptBundle(request, response);

			const bundle = response._getData();

			proclaim.deepStrictEqual(
				response.getHeader('content-type'),
				'text/plain; charset=UTF-8'
			);
			proclaim.deepStrictEqual(
				response.getHeader('cache-control'),
				'max-age=0, must-revalidate, no-cache, no-store'
			);
			proclaim.deepStrictEqual(response.statusCode, 400);

			proclaim.deepStrictEqual(
				bundle,
				'Origami Build Service returned an error: "The components query parameter can not be empty."'
			);
		});
	});

	context(
		'when given a request with components parameter as empty string',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = '';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter can not be empty."'
				);
			});
		}
	);

	context(
		'when given a request with a components parameter which contains duplicates',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test@1,o-test@1';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter contains duplicate component names. Please remove one of the follow from the components parameter: o-test"'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains empty component names',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test@1,,';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter can not contain empty component names."'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains a component name with whitespace at the start',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = ' o-test@1';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from ` o-test@1` to make the component name valid."'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains a component name with whitespace at the end',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test@1 ';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from `o-test@1 ` to make the component name valid."'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains a component name without a version',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The bundle request contains o-test with no version range, a version range is required.\\nPlease refer to TODO (build service documentation) for what is a valid version."'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains a component name with an invalid version',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test@5wg';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The version 5wg in o-test@5wg is not a valid version.\\nPlease refer to TODO (build service documentation) for what is a valid version."'
				);
			});
		}
	);
	context(
		'when given a request with a components parameter which contains a invalid component names',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-TeSt@5';
				request.query.system_code = 'origami';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The components query parameter contains component names which are not valid: o-TeSt."'
				);
			});
		}
	);

	context(
		'when given a request with an invalid system code',
		async () => {
			it('it responds with a plain text error message', async () => {
				const request = httpMock.createRequest();
				const response = httpMock.createResponse();
				response.startTime = sinon.spy();
				response.endTime = sinon.spy();
				request.app = {
					ft: {
						options: {
							npmRegistryURL: 'https://registry.npmjs.org'
						}
					}
				};
				request.query.components = 'o-test-component@2.2.9';
				request.query.system_code = '$$origami!';

				await createJavaScriptBundle(request, response);

				const bundle = response._getData();

				proclaim.deepStrictEqual(
					response.getHeader('content-type'),
					'text/plain; charset=UTF-8'
				);
				proclaim.deepStrictEqual(
					response.getHeader('cache-control'),
					'max-age=0, must-revalidate, no-cache, no-store'
				);
				proclaim.deepStrictEqual(response.statusCode, 400);

				proclaim.deepStrictEqual(
					bundle,
					'Origami Build Service returned an error: "The system_code query parameter must be a valid Biz-Ops System Code."'
				);
			});
		}
	);
});
