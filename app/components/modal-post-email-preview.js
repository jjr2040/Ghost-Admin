import ModalComponent from 'ghost-admin/components/modal-base';
import {action} from '@ember/object';
import {alias} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default ModalComponent.extend({
    ghostPaths: service(),
    ajax: service(),
    type: 'desktop',
    previewHtml: '',
    previewEmailSubject: null,
    post: alias('model'),
    actions: {
        changeType(type) {
            this.set('type', type);
        }
    },

    renderEmailPreview: action(async function renderEmailPreview() {
        try {
            const resourceId = this.post.id;
            const url = this.get('ghostPaths.url').api('/email_preview/posts', resourceId);
            let htmlData = this.get('previewHtml');
            let emailSubject = this.get('previewEmailSubject');
            if (!htmlData) {
                const response = await this.ajax.request(url);
                let [emailPreview] = response.email_previews;
                htmlData = emailPreview.html;
                emailSubject = emailPreview.subject;
            }

            let iframe = this.element.querySelector('iframe');
            if (iframe) {
                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(htmlData);
                iframe.contentWindow.document.close();
            }
            this.set('previewHtml', htmlData);
            this.set('previewEmailSubject', emailSubject);
        } catch (error) {
            // re-throw if we don't have a validation error
            if (error) {
                throw error;
            }
        }
    })
});