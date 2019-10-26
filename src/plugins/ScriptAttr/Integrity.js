'use strict';

const ssri = require('ssri');
const ReplaceSource = require('webpack-sources/lib/ReplaceSource');
const ScriptAttr = require('.');

class ScriptAttrIntegrity extends ScriptAttr {
    constructor(options = {}) {
        super('Integrity', Object.assign({
            ssri: {}
        }, options));
    }

    optionsResolver(compilation) {
        return { integrityHash: 'integrityHash' };
    }

    setupExtraHooks(compilation, { integrityHash }) {
        compilation.sriChunkAssets = {};

        compilation.hooks.chunkAsset.tap(this.pluginName, (chunk, asset) => {
            compilation.sriChunkAssets[chunk.id] = asset;
        });

        compilation.hooks.afterOptimizeAssets.tap(this.pluginName,
            (assets) => this._afterOptimizeAssets(compilation, assets));
    }

    localVarsResolver({ integrityHash }, chunk) {
        const childChunks = findChildChunks(chunk);
        const includedChunks = chunk.getChunkMaps().hash;

        if (!childChunks.length) {
            return source;
        }

        const hashes = childChunks.reduce((sriHashes, depChunk) => {
            if (includedChunks[depChunk.id.toString()]) {
                sriHashes[depChunk.id] = makePlaceholder(depChunk.id);
            }

            return sriHashes;
        }, {});

        return `var ${integrityHash} = ${JSON.stringify(hashes)};`;
    }

    codeResolver({ integrityHash }, chunk, hash, { chunkId, result }) {
        return `if (${integrityHash}[${chunkId}]) {
            ${result}.integrity = ${integrityHash}[${chunkId}];
        }`;
    }

    _afterOptimizeAssets(compilation, assets) {
        const hashByChunkId = {};

        // Replace placeholders in runtime chunks. Compute runtime chunks integrity.
        compilation.chunks.filter(isRuntimeChunk).forEach((chunk) => {
            this._replaceAsset(compilation, chunk, assets, hashByChunkId);
        });

        // Compute all other chunks integrity.
        Object.keys(assets).forEach((key) => {
            const asset = assets[key];
            asset.integrity = asset.integrity || computeIntegrity(asset, this.options.ssri);
        });
    }

    _replaceAsset(compilation, chunk, assets, hashByChunkId) {
        const oldAsset = getAssetById(compilation, chunk.id, assets);
        const newAsset = new ReplaceSource(oldAsset);
        const childChunks = findChildChunks(chunk);
        const oldSource = oldAsset.source();

        childChunks.forEach(({ id }) => {
            const magicMarker = makePlaceholder(id);
            const magicMarkerStart = oldSource.indexOf(magicMarker);
            const magicMarkerEnd = magicMarkerStart + magicMarker.length - 1;

            if (magicMarkerStart < 0) {
                return;
            }

            const asset = getAssetById(compilation, id, assets);
            const integrityHash = resolveIntegrity(id, hashByChunkId, asset, this.options.ssri);

            newAsset.replace(magicMarkerStart, magicMarkerEnd, integrityHash);
        });

        newAsset.integrity = resolveIntegrity(chunk.id, hashByChunkId, newAsset, this.options.ssri);

        setAssetById(compilation, chunk.id, assets, newAsset);
    }
}

function getAssetById(compilation, chunkId, assets) {
    const sourcePath = compilation.sriChunkAssets[chunkId];
    return assets[sourcePath];
}

function setAssetById(compilation, chunkId, assets, asset) {
    const sourcePath = compilation.sriChunkAssets[chunkId];
    return assets[sourcePath] = asset;
}

function addIfNotExist(set, item) {
    if (set.has(item)) {
        return true;
    }

    set.add(item);

    return false;
}

function findChildChunks(chunk) {
    const allChunks = new Set();
    const groupsVisited = new Set();

    function recurseChunk(childChunk) {
        if (addIfNotExist(allChunks, childChunk)) {
            return;
        }

        childChunk.groupsIterable.forEach(recurseGroup);
    }

    function recurseGroup(group) {
        if (addIfNotExist(groupsVisited, group.id)) {
            return;
        }

        group.chunks.forEach(recurseChunk);
        group.childrenIterable.forEach(recurseGroup);
    }

    recurseChunk(chunk);

    return Array.from(allChunks);
}

function makePlaceholder(id) {
    return '*-*-*-CHUNK-SRI-HASH-' + id + '-*-*-*';
}

function isRuntimeChunk(chunk) {
    return 'hasRuntime' in chunk ? chunk.hasRuntime() : chunk.entry;
}

function computeIntegrity(asset, options) {
    return ssri.fromData(asset.source(), options).toString();
}

function resolveIntegrity(chunkId, cache, asset, options) {
    cache[chunkId] = cache[chunkId] || computeIntegrity(asset, options);

    return cache[chunkId];
}

module.exports = ScriptAttrIntegrity;
