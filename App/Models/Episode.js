// Node Modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Helpers
const Pagination = require('App/Helpers/Pagination');

const Schema = mongoose.Schema;

const Episode = Schema(
{
    Course: { type: Schema.Types.ObjectId, ref: 'Course' },
    Title: { type: String, required: true },
    Type: { type: String, required: true },
    Description: { type: String, required: true },
    Time: { type: String, required: true },
    FileName: { type: String, required: true },
    EpisodeNumber: { type: Number, required: true },
    DownloadCount: { type: Number, default: 0 },
    ViewCount: { type: Number, default: 0 },
    CommentCount: { type: Number, default: 0 }
}, { timestamps: true });

Episode.plugin(Pagination);

Episode.methods.Download = function(IsAuthenticated, HasAccess)
{
    if (!IsAuthenticated)
        return '/Authentication/Login';

    let Status = false;

    switch (this.Type)
    {
        case 'Vip':
            Status = HasAccess;
            break;

        case 'Cash':
            Status = HasAccess;
            break;

        default:
            Status = true;
            break;
    }

    let TimeStamps = new Date().getTime() + 3600 * 1000 * 6;
    let SecretKey = process.env.DOWNLOAD_SECRET_KEY + this._id + TimeStamps;
    let Hash = bcrypt.hashSync(SecretKey, bcrypt.genSaltSync(15));

    return Status ? `/Course/Download/${this._id}?Mac=${Hash}&TimeStamps=${TimeStamps}` : '';
};

module.exports = mongoose.model('Episode', Episode);
